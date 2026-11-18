"""
Router chat konsultasi: buat room dan ambil riwayat pesan lewat HTTP.

Pesan realtime berjalan lewat Socket.io (app/sockets.py); router ini
hanya menangani pembuatan room dan pengambilan riwayat pesan.

@format
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..deps import get_current_user
from ..models import ChatRoom, Doctor, Message, User
from ..schemas import ChatMessageOut, ChatRoomOut

router = APIRouter(prefix="/api/chat", tags=["chat"])


class CreateRoomPayload(BaseModel):
    """Body POST /api/chat/rooms (camelCase, sesuai app React Native)."""

    doctorId: str


def to_room_out(room: ChatRoom) -> ChatRoomOut:
    """Konversi model ORM ChatRoom -> skema response camelCase."""
    return ChatRoomOut(
        id=room.id,
        userId=room.user_id,
        doctorId=room.doctor_id,
        createdAt=schemas.iso(room.created_at),
    )


@router.post("/rooms", response_model=ChatRoomOut)
def create_room(
    payload: CreateRoomPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat room chat dengan dokter; kalau sudah ada, kembalikan yang lama."""
    doctor = db.get(Doctor, payload.doctorId)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")

    room = db.scalar(
        select(ChatRoom).where(
            ChatRoom.user_id == current_user.id,
            ChatRoom.doctor_id == payload.doctorId,
        )
    )
    if room is None:
        room = ChatRoom(user_id=current_user.id, doctor_id=payload.doctorId)
        db.add(room)
        db.commit()
        db.refresh(room)

    return to_room_out(room)


@router.get("/{room_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    room_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Riwayat pesan satu room (urut waktu naik), hanya room milik user."""
    room = db.get(ChatRoom, room_id)
    if room is None or room.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Room tidak ditemukan")

    rows = db.scalars(
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.asc())
    ).all()
    return [
        ChatMessageOut(
            id=m.id,
            roomId=m.room_id,
            senderId=m.sender_id,
            content=m.content,
            createdAt=schemas.iso(m.created_at),
            status="sent",
            isMine=(m.sender_id == current_user.id),
        )
        for m in rows
    ]
