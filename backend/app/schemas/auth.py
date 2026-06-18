"""
Pyrobot — Auth Schemas
Pydantic models define the exact shape of every auth request/response.
They double as validation: a malformed request never reaches the service
layer — FastAPI rejects it with a 422 before our code runs at all.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back about a user. password_hash is deliberately absent —
    it never leaves the service/repository layer."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
