"""
Seed data awal: satu user demo dan lima dokter spesialis kulit.

Idempotent — hanya mengisi kalau tabel masih kosong, jadi aman dipanggil
setiap startup (lihat lifespan di app/main.py).

@format
"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Doctor, User
from .security import hash_password

# Lima dokter spesialis kulit Indonesia (data dummy untuk demo)
DOCTORS: list[dict] = [
    {
        "name": "dr. Anindya Prameswari, Sp.KK",
        "email": "anindya@blume.id",
        "specialization": "Spesialis Kulit dan Kelamin",
        "hospital": "RS Cipto Mangunkusumo, Jakarta",
        "rating": 4.9,
        "is_online": True,
        "price": 150000,
    },
    {
        "name": "dr. Bagas Wirawan, Sp.DVE",
        "email": "bagas@blume.id",
        "specialization": "Dermatologi, Venereologi, dan Estetika",
        "hospital": "RS Sardjito, Yogyakarta",
        "rating": 4.8,
        "is_online": True,
        "price": 100000,
    },
    {
        "name": "dr. Catharina Ayu, Sp.KK",
        "email": "catharina@blume.id",
        "specialization": "Spesialis Kulit dan Kelamin",
        "hospital": "RSUD Dr. Soetomo, Surabaya",
        "rating": 4.7,
        "is_online": False,
        "price": 75000,
    },
    {
        "name": "dr. Dimas Saputra, Sp.DVE",
        "email": "dimas@blume.id",
        "specialization": "Dermatologi, Venereologi, dan Estetika",
        "hospital": "RSUP Prof. Ngoerah, Denpasar",
        "rating": 4.6,
        "is_online": True,
        "price": 60000,
    },
    {
        "name": "dr. Eliza Rahmawati, Sp.KK",
        "email": "eliza@blume.id",
        "specialization": "Spesialis Kulit dan Kelamin",
        "hospital": "RS Hasan Sadikin, Bandung",
        "rating": 4.5,
        "is_online": False,
        "price": 50000,
    },
]


def seed(db: Session) -> None:
    """Isi data awal kalau tabel users/doctors masih kosong."""
    user_count = db.scalar(select(func.count()).select_from(User)) or 0
    if user_count == 0:
        db.add(
            User(
                name="Demo Blume",
                email="demo@blume.id",
                password_hash=hash_password("demo1234"),
            )
        )

    doctor_count = db.scalar(select(func.count()).select_from(Doctor)) or 0
    if doctor_count == 0:
        db.add_all([Doctor(**data) for data in DOCTORS])

    db.commit()
