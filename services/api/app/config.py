"""
Konfigurasi aplikasi Blume API.

Semua nilai bisa dioverride lewat environment variable, jadi file .env
cukup dipakai saat development.

@format
"""

import os
from pathlib import Path

# Muat .env kalau ada (python-dotenv opsional; kalau tidak ada, pakai env biasa)
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:  # pragma: no cover
    pass

BASE_DIR = Path(__file__).resolve().parent.parent


def _env(key: str, default: str) -> str:
    return os.environ.get(key, default)


def _path(value: str) -> Path:
    """Path relatif di .env dihitung dari folder services/api/, bukan dari CWD."""
    p = Path(value)
    return p if p.is_absolute() else (BASE_DIR / p).resolve()


class Settings:
    """Setting global, dibaca sekali saat import."""

    APP_NAME = "Blume API"
    VERSION = "0.1.0"

    # ── Server ──
    HOST = _env("HOST", "0.0.0.0")
    PORT = int(_env("PORT", "3000"))
    # URL publik untuk menyusun imageUrl (kosong = pakai base_url request)
    PUBLIC_BASE_URL = _env("PUBLIC_BASE_URL", "").rstrip("/")

    # ── Database ──
    DATABASE_URL = _env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'blume.db'}")

    # ── Auth ──
    JWT_SECRET = _env("JWT_SECRET", "dev-secret-ganti-di-produksi")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRE_DAYS = int(_env("JWT_EXPIRE_DAYS", "30"))

    # ── Upload ──
    UPLOAD_DIR = _path(_env("UPLOAD_DIR", str(BASE_DIR / "uploads")))
    MAX_UPLOAD_MB = int(_env("MAX_UPLOAD_MB", "10"))

    # ── Model ML ──
    MODEL_PATH = _path(_env("MODEL_PATH", str(BASE_DIR / "models" / "best_skindex_v5_320.pt")))
    ARTIFACTS_DIR = _path(_env("ARTIFACTS_DIR", str(BASE_DIR / "app" / "ml" / "artifacts")))
    # Load model saat startup (lebih lambat start, tapi request pertama cepat)
    WARM_MODEL = _env("WARM_MODEL", "0") == "1"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
