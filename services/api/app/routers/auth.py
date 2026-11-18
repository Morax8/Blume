"""
Router autentikasi: register, login, dan profil user.

Semua endpoint berada di bawah prefix /api/auth (dipakai authService
di aplikasi React Native).

@format
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import (
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    UpdateProfilePayload,
    UserOut,
)
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def to_user_out(user: User) -> UserOut:
    """Konversi model ORM User -> skema response camelCase."""
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        avatarUrl=user.avatar_url,
        phone=user.phone,
        createdAt=schemas.iso(user.created_at),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    """Daftar akun baru. Email harus unik; password di-hash dengan PBKDF2."""
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(token=create_access_token(user.id), user=to_user_out(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginPayload, db: Session = Depends(get_db)):
    """Login dengan email + password; kembalikan JWT dan data user."""
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email atau password salah")

    return AuthResponse(token=create_access_token(user.id), user=to_user_out(user))


@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login."""
    return to_user_out(current_user)


@router.patch("/profile", response_model=UserOut)
def update_profile(
    payload: UpdateProfilePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profil: hanya field yang dikirim (tidak None) yang diubah."""
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.avatarUrl is not None:
        current_user.avatar_url = payload.avatarUrl

    db.commit()
    db.refresh(current_user)
    return to_user_out(current_user)
