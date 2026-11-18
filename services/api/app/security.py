"""
Hash password dan JWT.

Password memakai PBKDF2-HMAC-SHA256 dari stdlib (tanpa dependency bcrypt),
JWT memakai PyJWT.

@format
"""

import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt

from .config import settings

_ITERATIONS = 120_000


def hash_password(password: str) -> str:
    """Hasilkan string 'pbkdf2_sha256$iterasi$salt_hex$hash_hex'."""
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    """Cek password terhadap hash tersimpan (constant-time compare)."""
    try:
        algo, iterations, salt_hex, hash_hex = stored.split("$")
    except ValueError:
        return False
    if algo != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), bytes.fromhex(salt_hex), int(iterations)
    )
    return hmac.compare_digest(digest.hex(), hash_hex)


def create_access_token(user_id: str) -> str:
    """Buat JWT berisi sub=user_id."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRE_DAYS)
    payload: dict[str, Any] = {"sub": user_id, "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """Kembalikan user_id dari token, atau None kalau tidak valid/kadaluarsa."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
