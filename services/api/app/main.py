"""
Entry point Blume API.

Menggabungkan FastAPI (HTTP: /api, /uploads, /health) dengan server
Socket.io (path /socket.io) dalam satu aplikasi ASGI, sehingga cukup
satu proses uvicorn di port 3000:

    uvicorn app.main:app --host 0.0.0.0 --port 3000

Objek `app` di baris terakhir adalah ASGIApp gabungan — itulah yang
dijalankan uvicorn (bukan `fastapi_app`).

@format
"""

import logging
from contextlib import asynccontextmanager

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, SessionLocal, engine
from .ml.inference import predictor
from .routers import auth, chat, detection, doctors
from .schemas import HealthOut
from .seed import seed
from .sockets import sio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("blume")


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Startup: buat tabel, isi seed data, dan (opsional) muat model ML."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed(db)
    if settings.WARM_MODEL:
        predictor.load()
    logger.info(
        "Blume API siap (model mode: %s, loaded: %s)", predictor.mode, predictor.is_ready
    )
    yield


fastapi_app = FastAPI(title="Blume API", version="0.1.0", lifespan=lifespan)

# CORS terbuka: app React Native diakses dari berbagai origin/emulator
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(auth.router)
fastapi_app.include_router(doctors.router)
fastapi_app.include_router(detection.router)
fastapi_app.include_router(chat.router)

# File gambar hasil upload disajikan statis di /uploads
fastapi_app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")


@fastapi_app.get("/health", response_model=HealthOut, tags=["health"])
def health():
    """Cek status server: model ML, jumlah kelas, dan koneksi database."""
    return HealthOut(
        status="ok",
        modelMode=predictor.mode,
        modelLoaded=predictor.is_ready,
        modelPath=str(settings.MODEL_PATH),
        numClasses=len(predictor.classes),
        database=engine.url.render_as_string(hide_password=True),
    )


# Request /socket.io/* ditangani Socket.io, sisanya diteruskan ke FastAPI.
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="socket.io")
