"""
Pyrobot — V1 Auth Endpoints
POST /register, POST /login, GET /me

Routers stay thin on purpose: parse the request (FastAPI + Pydantic already
did that by the time we're here), call the service layer, translate whatever
the service raises into the right HTTP status code. No business logic here.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    AuthService,
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    UsernameAlreadyTakenError,
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    service = AuthService(db)
    try:
        user = await service.register_user(
            email=payload.email, username=payload.username, password=payload.password
        )
    except EmailAlreadyRegisteredError:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Email already registered")
    except UsernameAlreadyTakenError:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Username already taken")
    return user


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):
    service = AuthService(db)
    try:
        user = await service.authenticate_user(email=payload.email, password=payload.password)
    except InvalidCredentialsError:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = service.create_token_for_user(user)
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
