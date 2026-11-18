"""
Router dokter: daftar dan detail dokter spesialis kulit.

Semua endpoint butuh login. Urutan daftar: dokter online dulu, lalu
rating tertinggi (dipakai doctorService di aplikasi React Native).

@format
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Doctor, User
from ..schemas import DoctorOut

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


def to_doctor_out(doctor: Doctor) -> DoctorOut:
    """Konversi model ORM Doctor -> skema response camelCase."""
    return DoctorOut(
        id=doctor.id,
        name=doctor.name,
        email=doctor.email,
        avatarUrl=doctor.avatar_url,
        specialization=doctor.specialization,
        hospital=doctor.hospital,
        rating=doctor.rating,
        isOnline=doctor.is_online,
        price=doctor.price,
    )


@router.get("", response_model=list[DoctorOut])
def list_doctors(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Daftar semua dokter: yang online dulu, lalu rating tertinggi."""
    rows = db.scalars(
        select(Doctor).order_by(Doctor.is_online.desc(), Doctor.rating.desc())
    ).all()
    return [to_doctor_out(d) for d in rows]


@router.get("/{doctor_id}", response_model=DoctorOut)
def get_doctor(
    doctor_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """Detail satu dokter berdasarkan ID."""
    doctor = db.get(Doctor, doctor_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="Dokter tidak ditemukan")
    return to_doctor_out(doctor)
