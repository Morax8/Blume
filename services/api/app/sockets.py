"""
Server Socket.io untuk chat realtime.

Dipasang di path /socket.io (di luar prefix /api) lewat socketio.ASGIApp
di app/main.py. Autentikasi memakai JWT yang sama dengan HTTP: client
mengirim {"token": "..."} di auth saat handshake, atau fallback lewat
query string ?token=...

Event yang didukung:
  connect       -> validasi token, simpan user_id di session
  joinRoom      -> masuk room {roomId}
  leaveRoom     -> keluar room {roomId}
  sendMessage   -> simpan pesan {roomId, content} + broadcast receiveMessage
  disconnect    -> log saja

@format
"""

import logging
from urllib.parse import parse_qs

import socketio

from . import schemas
from .database import SessionLocal
from .models import ChatRoom, Message
from .security import decode_access_token

logger = logging.getLogger("blume.socket")

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


def _token_from_query(environ: dict) -> str | None:
    """Ambil token dari query string handshake (?token=...)."""
    query = parse_qs(environ.get("QUERY_STRING", "") or "")
    values = query.get("token")
    return values[0] if values else None


@sio.event
async def connect(sid: str, environ: dict, auth: dict | None):
    """Validasi JWT sebelum koneksi diterima; return False -> connect_error."""
    token = auth.get("token") if isinstance(auth, dict) else None
    if not token:
        token = _token_from_query(environ)

    user_id = decode_access_token(token) if token else None
    if not user_id:
        logger.warning("Koneksi socket ditolak (token invalid): sid=%s", sid)
        return False

    await sio.save_session(sid, {"user_id": user_id})
    logger.info("Socket terhubung: sid=%s user=%s", sid, user_id)


@sio.on("joinRoom")
async def join_room(sid: str, data):
    """Masuk ke room chat supaya ikut menerima broadcast pesan."""
    room_id = data.get("roomId") if isinstance(data, dict) else None
    if not room_id:
        return False
    await sio.enter_room(sid, room_id)
    logger.info("joinRoom: sid=%s room=%s", sid, room_id)


@sio.on("leaveRoom")
async def leave_room(sid: str, data):
    """Keluar dari room chat."""
    room_id = data.get("roomId") if isinstance(data, dict) else None
    if not room_id:
        return False
    await sio.leave_room(sid, room_id)
    logger.info("leaveRoom: sid=%s room=%s", sid, room_id)


@sio.on("sendMessage")
async def send_message(sid: str, data):
    """Simpan pesan ke DB lalu broadcast 'receiveMessage' ke seluruh room."""
    session = await sio.get_session(sid)
    user_id = session.get("user_id") if session else None
    if not user_id or not isinstance(data, dict):
        return False

    room_id = data.get("roomId")
    content = str(data.get("content") or "").strip()
    if not room_id or not content:
        return False

    db = SessionLocal()
    try:
        # Pastikan room ada sebelum menyimpan pesan
        room = db.get(ChatRoom, room_id)
        if room is None:
            return False

        message = Message(room_id=room_id, sender_id=user_id, content=content)
        db.add(message)
        db.commit()
        db.refresh(message)

        payload = {
            "id": message.id,
            "roomId": message.room_id,
            "senderId": message.sender_id,
            "content": message.content,
            "createdAt": schemas.iso(message.created_at),
            "status": "sent",
        }
    finally:
        db.close()

    await sio.emit("receiveMessage", payload, room=room_id)


@sio.event
async def disconnect(sid: str):
    """Client terputus: cukup dicatat di log."""
    logger.info("Socket terputus: sid=%s", sid)
