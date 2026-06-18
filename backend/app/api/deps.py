"""
Pyrobot — Shared API Dependencies
FastAPI dependency functions injected into route handlers via Depends().
Anything that needs "who is the logged-in user?" imports get_current_user
from here, rather than each router re-implementing JWT decoding.
"""
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

# tokenUrl only points Swagger's "Authorize" button at /login for docs/testing
# convenience — we issue tokens via a plain JSON body, not OAuth2's form flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        raw_subject = payload.get("sub")
        if raw_subject is None:
            raise credentials_error
        user_id = uuid.UUID(raw_subject)
    except (JWTError, ValueError):
        # JWTError: bad signature, expired, malformed token.
        # ValueError: "sub" claim wasn't a parseable UUID.
        raise credentials_error

    user = await UserRepository(db).get_by_id(user_id)
    if user is None or not user.is_active:
        raise credentials_error
    return user
