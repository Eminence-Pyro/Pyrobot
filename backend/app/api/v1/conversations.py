from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

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


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    payload: ConversationCreate,
    session=Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
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
    session=Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
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
    session=Depends(get_db),
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ] = None,
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