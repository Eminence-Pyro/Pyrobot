"""
Pyrobot — Message Endpoints
Nested under a conversation, since every message belongs to exactly one —
mirrors the data model rather than treating messages as a flat resource.
Mounted under the same "/api/v1/conversations" prefix as conversations.py
(see main.py) — this file owns everything under .../{conversation_id}/messages.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.message import MessageCreate, MessageExchangeResponse, MessageResponse
from app.services.message_service import ConversationNotFoundError, MessageService

router = APIRouter()

DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageExchangeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    session: DbSession,
    current_user: CurrentUser,
):
    service = MessageService(session)

    try:
        user_message, assistant_message = await service.send_message(
            conversation_id=conversation_id,
            user_id=current_user.id,
            content=payload.content,
            model=payload.model,
        )
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    return MessageExchangeResponse(
    user_message=MessageResponse.model_validate(user_message),
    assistant_message=MessageResponse.model_validate(assistant_message),
    )


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
async def list_messages(
    conversation_id: UUID,
    session: DbSession,
    current_user: CurrentUser,
):
    service = MessageService(session)

    try:
        return await service.list_messages(
            conversation_id=conversation_id,
            user_id=current_user.id,
        )
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )