"""
Pyrobot — Memory Endpoints
Per Master Document §4.4: a simple per-user key-value store. Every
operation is scoped to the authenticated user — there is no cross-user
read path, by construction (every repository method takes user_id).
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.memory import MemoryResponse, MemorySet
from app.services.memory_service import MemoryService

router = APIRouter()

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("", response_model=list[MemoryResponse])
async def get_all_memory(session: DbSession, current_user: CurrentUser):
    service = MemoryService(session)
    return await service.get_all_memory(user_id=current_user.id)


@router.put("/{key}", response_model=MemoryResponse)
async def set_memory(
    key: str,
    payload: MemorySet,
    session: DbSession,
    current_user: CurrentUser,
):
    service = MemoryService(session)
    return await service.set_memory(
        user_id=current_user.id, key=key, value=payload.value
    )


@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(key: str, session: DbSession, current_user: CurrentUser):
    service = MemoryService(session)
    deleted = await service.delete_memory(user_id=current_user.id, key=key)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Memory key not found"
        )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_memory(session: DbSession, current_user: CurrentUser):
    service = MemoryService(session)
    await service.clear_memory(user_id=current_user.id)