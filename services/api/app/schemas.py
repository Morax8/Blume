"""
Skema Pydantic (request & response) untuk Blume API.

Nama field response memakai camelCase supaya langsung cocok dengan tipe
TypeScript di aplikasi React Native (lihat src/types/*.ts).

@format
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ─────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────
def iso(dt: Optional[datetime]) -> str:
    """Format datetime jadi ISO 8601 dengan sufiks Z."""
    if dt is None:
        return ""
    return dt.isoformat() + "Z"


# ─────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────
class RegisterPayload(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class UpdateProfilePayload(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=30)
    avatarUrl: Optional[str] = Field(default=None, max_length=500)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    avatarUrl: Optional[str] = None
    phone: Optional[str] = None
    createdAt: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ─────────────────────────────────────────────────────────────
# Doctor
# ─────────────────────────────────────────────────────────────
class DoctorOut(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    avatarUrl: Optional[str] = None
    specialization: str
    hospital: Optional[str] = None
    rating: Optional[float] = None
    isOnline: Optional[bool] = None
    price: Optional[int] = None


# ─────────────────────────────────────────────────────────────
# Detection
# ─────────────────────────────────────────────────────────────
class DetectionResult(BaseModel):
    id: str
    imageUrl: str
    diseaseName: str
    confidence: float
    isHealthy: bool
    description: Optional[str] = None
    recommendations: Optional[list[str]] = None
    status: Optional[str] = "completed"
    createdAt: str
    # Field tambahan (tidak ada di tipe RN, aman diabaikan)
    severity: Optional[str] = None
    topPredictions: Optional[list["PredictionOut"]] = None
    modelMode: Optional[str] = None


class PredictionOut(BaseModel):
    diseaseName: str
    confidence: float


class DetectionHistoryItem(BaseModel):
    id: str
    imageUrl: str
    diseaseName: str
    confidence: float
    isHealthy: bool
    scannedAt: str


# ─────────────────────────────────────────────────────────────
# Chat
# ─────────────────────────────────────────────────────────────
class ChatMessageOut(BaseModel):
    id: str
    roomId: str
    senderId: str
    content: str
    createdAt: str
    status: Optional[str] = "sent"
    isMine: Optional[bool] = None


class ChatRoomOut(BaseModel):
    id: str
    userId: str
    doctorId: str
    createdAt: str


class HealthOut(BaseModel):
    status: str
    modelMode: str
    modelLoaded: bool
    modelPath: str
    numClasses: int
    database: str
