"""
Pyrobot — Security Utilities
Password hashing (Argon2) and JWT access token creation/verification.
Nothing in this file knows about HTTP, FastAPI, or the database —
it's pure cryptographic primitives, reused by the service and dependency layers.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Argon2 is the current Password Hashing Competition winner — memory-hard,
# meaning it resists GPU/ASIC cracking far better than bcrypt. passlib handles
# salt generation and verification; argon2-cffi does the actual hashing work.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password for storage. The plaintext itself is never stored."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Check a plaintext password against a stored Argon2 hash."""
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token.

    `subject` is the user's id as a string — JWT convention puts the primary
    identifier in the "sub" (subject) claim.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT's signature and expiry.

    Raises jose.JWTError on anything invalid (expired, bad signature, malformed) —
    the caller (api/deps.py) is responsible for turning that into a 401 response.
    """
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
