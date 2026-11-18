"""Verifikasi mode REAL: load checkpoint 460 MB + inferensi CPU.

Membuktikan tiga hal yang tidak bisa dibuktikan di mode demo:
  1. state_dict checkpoint COCOK 100% dengan app/ml/architecture.py (strict=True)
  2. preprocessing (resize -> center crop -> normalize) jalan tanpa error
  3. latensi inferensi CPU terukur (bahan untuk laporan)

Jalankan dari folder services/api/:
    .venv/Scripts/python.exe scripts/verify_real_mode.py
"""

from __future__ import annotations

import io
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from PIL import Image, ImageDraw  # noqa: E402

from app.config import settings  # noqa: E402
from app.ml.inference import predictor  # noqa: E402


def buat_gambar(warna: tuple[int, int, int], pola: str) -> bytes:
    """Gambar sintetis 800x600 dengan pola berbeda (bukan foto asli)."""
    img = Image.new("RGB", (800, 600), warna)
    d = ImageDraw.Draw(img)
    if pola == "titik":
        for x in range(0, 800, 40):
            for y in range(0, 600, 40):
                d.ellipse([x, y, x + 18, y + 18], fill=(120, 40, 40))
    elif pola == "garis":
        for y in range(0, 600, 25):
            d.line([(0, y), (800, y)], fill=(200, 120, 60), width=6)
    else:
        d.rectangle([200, 150, 600, 450], fill=(90, 30, 30))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=92)
    return buf.getvalue()


def garis(judul: str) -> None:
    print("\n" + "─" * 62)
    print(judul)
    print("─" * 62)


def main() -> int:
    print("=" * 62)
    print("BLUME — VERIFIKASI MODE REAL (CPU)")
    print("=" * 62)
    print(f"checkpoint   : {settings.MODEL_PATH}")
    print(f"file ada     : {settings.MODEL_PATH.exists()}")

    ukuran = settings.MODEL_PATH.stat().st_size / 1024 / 1024 if settings.MODEL_PATH.exists() else 0
    print(f"ukuran       : {ukuran:.1f} MB")

    # ── 1. Load model ──
    garis("1. LOAD CHECKPOINT (map_location=cpu, strict=True)")
    t0 = time.perf_counter()
    ok = predictor.load()
    t_load = time.perf_counter() - t0

    print(f"hasil load   : {ok}")
    print(f"mode aktif   : {predictor.mode}")
    print(f"load time    : {t_load:.2f} s")
    print(f"load error   : {predictor.load_error}")

    if predictor.mode != "real":
        print("\n❌ GAGAL: predictor masih mode demo — checkpoint tidak terpakai.")
        print("   Cek 'load error' di atas. Jangan lanjut ke deploy.")
        return 1
    print("\n✅ state_dict COCOK dengan architecture.py (strict=True lolos)")

    # ── 2. Info model ──
    garis("2. INFO MODEL")
    model = getattr(predictor, "_model", None)
    if model is not None:
        total = sum(p.numel() for p in model.parameters())
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        print(f"parameter    : {total:,}")
        print(f"trainable    : {trainable:,}")
        print(f"training mode: {model.training}  (harus False = eval)")
    print(f"jumlah kelas : {len(predictor.classes)}")
    print(f"input size   : {getattr(predictor, 'input_size', '?')}")
    print(f"resize size  : {getattr(predictor, 'resize_size', '?')}")

    # ── 3. Inferensi + latensi ──
    garis("3. INFERENSI + LATENSI CPU")
    gambar = {
        "merah titik": buat_gambar((200, 150, 150), "titik"),
        "garis coklat": buat_gambar((180, 140, 120), "garis"),
        "blok gelap": buat_gambar((160, 120, 120), "blok"),
    }

    latensi: list[float] = []
    for nama, data in gambar.items():
        t0 = time.perf_counter()
        hasil = predictor.predict(data)
        dt = time.perf_counter() - t0
        latensi.append(dt)

        top = hasil["topPredictions"][:3]
        print(f"\n{nama} ({len(data)/1024:.0f} KB) — {dt*1000:.0f} ms")
        print(f"  mode        : {hasil['mode']}")
        print(f"  prediksi    : {hasil['diseaseName']}  ({hasil['confidence']*100:.1f}%)")
        print(f"  isHealthy   : {hasil['isHealthy']} | severity: {hasil['severity']}")
        print(f"  top-3       : " + ", ".join(f"{p['diseaseName']} {p['confidence']*100:.1f}%" for p in top))

    # ── 4. Determinisme ──
    garis("4. DETERMINISME (gambar sama -> hasil sama)")
    a = predictor.predict(gambar["merah titik"])
    b = predictor.predict(gambar["merah titik"])
    sama = a["diseaseName"] == b["diseaseName"] and abs(a["confidence"] - b["confidence"]) < 1e-6
    print(f"identik      : {sama}")
    if not sama:
        print("  ⚠️  tidak deterministik — cek dropout / model.train()")

    # ── 5. Ringkasan ──
    garis("RINGKASAN")
    rata = sum(latensi) / len(latensi)
    print(f"latensi rata-rata : {rata*1000:.0f} ms/gambar")
    print(f"latensi min/max   : {min(latensi)*1000:.0f} / {max(latensi)*1000:.0f} ms")
    print(f"throughput        : {1/rata:.2f} gambar/detik (1 core-ish, CPU)")
    print(f"waktu load        : {t_load:.2f} s (WARM_MODEL=1 saat startup)")
    print("\n✅ MODE REAL SIAP DIPAKAI")

    return 0 if sama else 1


if __name__ == "__main__":
    raise SystemExit(main())
