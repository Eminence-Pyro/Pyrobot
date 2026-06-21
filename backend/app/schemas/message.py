from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    """The new user message being sent into a conversation."""
    content: str = Field(min_length=1)
    model: str = "gpt-5.5"


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageExchangeResponse(BaseModel):
    """
    Returned by POST .../messages — both the saved user message and the
    AI's reply in one response, so the full round trip is confirmable
    without a second request.
    """
    user_message: MessageResponse
    assistant_message: MessageResponse