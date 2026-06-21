from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.conversation import (
    ConversationCreate,
    ConversationResponse,
)
from app.services.conversation_service import (
    ConversationService,
)

router = APIRouter()

# Neither alias carries a literal Python default — Depends() lives inside
# Annotated's metadata, not as `= Depends(...)`. That's what actually
# fixes the Pylance errors: there's no longer anything for the "non-default
# argument follows default argument" rule to trip on, so no fake default
# (`= None`, `= ...`) is needed on any parameter, in any order.
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    payload: ConversationCreate,
    session: DbSession,
    current_user: CurrentUser,
):
    service = ConversationService(session)

    return await service.create_conversation(
        user_id=current_user.id,
        title=payload.title,
    )


@router.get(
    "",
    response_model=list[ConversationResponse],
)
async def list_conversations(
    session: DbSession,
    current_user: CurrentUser,
):
    service = ConversationService(session)

    return await service.list_conversations(
        user_id=current_user.id
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
)
async def get_conversation(
    conversation_id: UUID,
    session: DbSession,
    current_user: CurrentUser,
):
    service = ConversationService(session)

    conversation = await service.get_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return conversation