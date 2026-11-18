"""
Inference model Skindex v3.

Dua mode:
  - "real" : model PyTorch asli (butuh torch + torchvision + file .pt)
  - "demo" : prediksi dummy deterministik, dipakai kalau model belum tersedia
             supaya backend tetap bisa dites end-to-end.

TTA dinonaktifkan karena hasil evaluasi menunjukkan TTA 4-flip (89.46%)
lebih rendah dari tanpa TTA (89.57%), dan 4x lebih lambat.

@format
"""

import hashlib
import io
import json
import logging
import threading
from pathlib import Path
from typing import Any, Optional

import numpy as np
from PIL import Image, ImageOps

from ..config import settings

logger = logging.getLogger("blume.ml")

# Fallback kalau artifacts belum ada
DEFAULT_CLASSES = ["Normal"]
DEFAULT_META: dict[str, Any] = {
    "inputSize": 320,
    "resizeSize": 352,
    "normalization": {"mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225]},
    "tta": {"enabled": False},
    "healthyClasses": ["Normal"],
}


class Predictor:
    """Singleton predictor: load model sekali, dipakai ulang antar request."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._model: Any = None
        self._torch: Any = None
        self._tried = False
        self.mode = "demo"
        self.load_error: Optional[str] = None

        self.classes = self._load_json("class_labels.json", DEFAULT_CLASSES)
        self.disease_info: dict[str, dict[str, Any]] = self._load_json("disease_info.json", {})
        self.meta = self._load_json("model_meta.json", DEFAULT_META)

        self.input_size = int(self.meta.get("inputSize", 320))
        self.resize_size = int(self.meta.get("resizeSize", 352))
        norm = self.meta.get("normalization", DEFAULT_META["normalization"])
        self.mean = np.array(norm["mean"], dtype=np.float32)
        self.std = np.array(norm["std"], dtype=np.float32)
        self.healthy_classes = set(self.meta.get("healthyClasses", ["Normal"]))

    # ─────────────────────────────────────────────────────────
    # Loading
    # ─────────────────────────────────────────────────────────
    def _load_json(self, filename: str, default: Any) -> Any:
        path = Path(settings.ARTIFACTS_DIR) / filename
        if not path.exists():
            logger.warning("Artifact tidak ditemukan: %s", path)
            return default
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    def load(self) -> bool:
        """Coba muat model asli. Aman dipanggil berkali-kali."""
        if self._model is not None:
            return True
        with self._lock:
            if self._model is not None:
                return True
            if self._tried and self._model is None and self.load_error:
                return False
            self._tried = True

            if not Path(settings.MODEL_PATH).exists():
                self.load_error = f"File model tidak ada: {settings.MODEL_PATH}"
                logger.warning("%s -> mode demo", self.load_error)
                return False

            try:
                import torch  # noqa: PLC0415 — import berat, sengaja lazy

                from .architecture import load_model  # noqa: PLC0415

                self._torch = torch
                self._model = load_model(settings.MODEL_PATH, num_classes=len(self.classes))
                self.mode = "real"
                self.load_error = None
                logger.info("Model dimuat: %s (%d kelas)", settings.MODEL_PATH, len(self.classes))
                return True
            except ImportError:
                self.load_error = "torch/torchvision belum terinstall -> mode demo"
                logger.warning(self.load_error)
                return False
            except Exception as exc:  # noqa: BLE001 — laporkan apa pun penyebabnya
                self.load_error = f"Gagal memuat model: {exc}"
                logger.exception("Gagal memuat model")
                return False

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    # ─────────────────────────────────────────────────────────
    # Preprocessing
    # ─────────────────────────────────────────────────────────
    def _preprocess(self, image_bytes: bytes) -> Any:
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)  # hormati orientasi foto HP
        img = img.convert("RGB")
        img = img.resize((self.resize_size, self.resize_size), Image.BILINEAR)

        offset = (self.resize_size - self.input_size) // 2
        img = img.crop(
            (offset, offset, offset + self.input_size, offset + self.input_size)
        )

        arr = np.asarray(img).astype(np.float32) / 255.0
        arr = (arr - self.mean) / self.std
        arr = np.transpose(arr, (2, 0, 1))
        return self._torch.from_numpy(arr).unsqueeze(0)

    # ─────────────────────────────────────────────────────────
    # Prediksi
    # ─────────────────────────────────────────────────────────
    def predict(self, image_bytes: bytes, top_k: int = 5) -> dict[str, Any]:
        """Kembalikan prediksi teratas + info penyakit."""
        if self.load() and self._model is not None:
            probs = self._predict_real(image_bytes)
            mode = "real"
        else:
            probs = self._predict_demo(image_bytes)
            mode = "demo"

        order = np.argsort(probs)[::-1][:top_k]
        top = [
            {"diseaseName": self.classes[int(i)], "confidence": float(probs[int(i)])}
            for i in order
        ]
        best = top[0]
        info = self.disease_info.get(best["diseaseName"], {})

        return {
            "mode": mode,
            "diseaseName": best["diseaseName"],
            "confidence": best["confidence"],
            "isHealthy": best["diseaseName"] in self.healthy_classes,
            "description": info.get("description"),
            "recommendations": info.get("recommendations", []),
            "severity": info.get("severity"),
            "topPredictions": top,
        }

    def _predict_real(self, image_bytes: bytes) -> np.ndarray:
        tensor = self._preprocess(image_bytes)
        with self._torch.inference_mode():
            logits = self._model(tensor)
            probs = self._torch.softmax(logits, dim=1)[0]
        return probs.cpu().numpy().astype(np.float32)

    def _predict_demo(self, image_bytes: bytes) -> np.ndarray:
        """Prediksi dummy deterministik: gambar sama -> hasil sama."""
        n = len(self.classes)
        seed = int.from_bytes(hashlib.sha256(image_bytes).digest()[:8], "big")
        rng = np.random.default_rng(seed)

        logits = rng.normal(0.0, 1.0, n).astype(np.float32)
        dominant = seed % n
        logits[dominant] += 3.0

        exp = np.exp(logits - logits.max())
        return (exp / exp.sum()).astype(np.float32)


predictor = Predictor()


def warm_up() -> None:
    """Panggil saat startup kalau WARM_MODEL=1."""
    predictor.load()
