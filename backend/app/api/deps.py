"""
Pyrobot — Shared API Dependencies
FastAPI dependency functions injected into route handlers via Depends().
Anything that needs "who is the logged-in user?" imports get_current_user
from here, rather than each router re-implementing JWT decoding.
"""
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

# HTTPBearer (not OAuth2PasswordBearer) on purpose: our /login issues a JWT
# from a plain JSON body, not an OAuth2 password-grant form. OAuth2PasswordBearer
# tells Swagger's "Authorize" button to render a username/password/client_id
# form that POSTs form-encoded data to tokenUrl — which doesn't match our
# JSON login endpoint at all. HTTPBearer just means "read whatever's in the
# Authorization header" and gives Swagger a single paste-the-token field.
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        # auto_error=False means HTTPBearer returns None instead of raising
        # its own 403 here — we raise our own 401 to match the documented
        # AUTH_INVALID contract (missing or malformed token -> 401).
        raise credentials_error
    token = credentials.credentials
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
