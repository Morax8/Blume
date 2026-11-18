"""
Router deteksi penyakit kulit: upload gambar, riwayat, detail, dan hapus.

Prediksi ML selalu lewat `predictor` (app/ml/inference.py) — file ini
tidak pernah import torch langsung. Endpoint dibuat sync (def) supaya
inference yang berat dijalankan FastAPI di threadpool, tidak memblokir
event loop yang juga melayani Socket.io.

@format
"""

import json
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas
from ..config import settings
from ..database import get_db
from ..deps import get_current_user
from ..ml.inference import predictor
from ..models import Detection, User
from ..schemas import DetectionHistoryItem, DetectionResult

logger = logging.getLogger("blume.detection")

router = APIRouter(prefix="/api/detection", tags=["detection"])

# Ekstensi gambar yang diterima; di luar daftar ini dipaksa jadi .jpg
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def _base_url(request: Request) -> str:
    """Base URL publik untuk menyusun imageUrl hasil scan."""
    if settings.PUBLIC_BASE_URL:
        return settings.PUBLIC_BASE_URL
    return str(request.base_url).rstrip("/")


def _parse_recommendations(raw: str | None) -> list[str]:
    """Baca kolom recommendations (JSON array) dengan aman."""
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return []
    return [str(item) for item in data] if isinstance(data, list) else []


def to_detection_result(row: Detection, base_url: str) -> DetectionResult:
    """Konversi baris Detection -> DetectionResult (camelCase).

    topPredictions/severity tidak disimpan di DB, jadi direkonstruksi:
    severity diambil dari disease_info, topPredictions dari nilai tersimpan.
    """
    info = predictor.disease_info.get(row.disease_name, {})
    return DetectionResult(
        id=row.id,
        imageUrl=f"{base_url}/uploads/{row.image_path}",
        diseaseName=row.disease_name,
        confidence=row.confidence,
        isHealthy=row.is_healthy,
        description=row.description,
        recommendations=_parse_recommendations(row.recommendations),
        status=row.status,
        createdAt=schemas.iso(row.created_at),
        severity=info.get("severity"),
        topPredictions=[{"diseaseName": row.disease_name, "confidence": row.confidence}],
        modelMode=row.model_mode,
    )


def to_history_item(row: Detection, base_url: str) -> DetectionHistoryItem:
    """Konversi baris Detection -> item ringkas untuk list riwayat."""
    return DetectionHistoryItem(
        id=row.id,
        imageUrl=f"{base_url}/uploads/{row.image_path}",
        diseaseName=row.disease_name,
        confidence=row.confidence,
        isHealthy=row.is_healthy,
        scannedAt=schemas.iso(row.created_at),
    )


def _get_owned(row_id: str, user: User, db: Session) -> Detection:
    """Ambil detection milik user; 404 kalau tidak ada/bukan miliknya."""
    row = db.get(Detection, row_id)
    if row is None or row.user_id != user.id:
        raise HTTPException(status_code=404, detail="Deteksi tidak ditemukan")
    return row


@router.post("", response_model=DetectionResult)
def create_detection(
    request: Request,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload foto kulit -> prediksi ML -> simpan hasil -> DetectionResult."""
    # 1. Validasi tipe file: harus image/*
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar")

    # 2. Baca isi file + validasi ukuran maksimal
    image_bytes = image.file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File harus berupa gambar")
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Ukuran gambar maksimal {settings.MAX_UPLOAD_MB} MB",
        )

    # 3. Simpan ke UPLOAD_DIR dengan nama acak (ext dari nama asli, default .jpg)
    ext = Path(image.filename or "").suffix.lower()
    if ext not in ALLOWED_EXT:
        ext = ".jpg"
    filename = f"{uuid4().hex}{ext}"
    dest = Path(settings.UPLOAD_DIR) / filename
    dest.write_bytes(image_bytes)

    # 4. Prediksi lewat predictor (mode real/demo ditentukan otomatis)
    try:
        hasil = predictor.predict(image_bytes)
    except Exception as exc:  # noqa: BLE001 — gambar rusak dsb. -> 400, bukan 500
        dest.unlink(missing_ok=True)
        logger.exception("Prediksi gagal untuk %s", filename)
        raise HTTPException(status_code=400, detail="Gambar tidak dapat diproses") from exc

    # 5. Simpan hasil ke database
    row = Detection(
        user_id=current_user.id,
        image_path=filename,
        disease_name=hasil["diseaseName"],
        confidence=hasil["confidence"],
        is_healthy=hasil["isHealthy"],
        description=hasil["description"],
        recommendations=json.dumps(hasil["recommendations"], ensure_ascii=False),
        status="completed",
        model_mode=hasil["mode"],
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return to_detection_result(row, _base_url(request))


@router.get("/history", response_model=list[DetectionHistoryItem])
def list_history(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Riwayat deteksi milik user sendiri, terbaru dulu."""
    rows = db.scalars(
        select(Detection)
        .where(Detection.user_id == current_user.id)
        .order_by(Detection.created_at.desc())
    ).all()
    base = _base_url(request)
    return [to_history_item(r, base) for r in rows]


@router.get("/{detection_id}", response_model=DetectionResult)
def get_detection(
    detection_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Detail satu hasil deteksi (hanya milik user sendiri)."""
    row = _get_owned(detection_id, current_user, db)
    return to_detection_result(row, _base_url(request))


@router.delete("/{detection_id}")
def delete_detection(
    detection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus satu hasil deteksi + file gambarnya dari disk."""
    row = _get_owned(detection_id, current_user, db)

    # Ambil nama file SEBELUM delete (atribut ORM expired setelah commit)
    image_path = Path(row.image_path).name
    db.delete(row)
    db.commit()

    # Hapus file gambar; abaikan kalau gagal (DB sudah bersih)
    try:
        (Path(settings.UPLOAD_DIR) / image_path).unlink(missing_ok=True)
    except OSError:
        logger.warning("Gagal menghapus file gambar %s", image_path)

    return {"success": True}
