from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    # Required — matches models/conversation.py's nullable=False on the
    # live, already-migrated table. "Auto-generate title from the first
    # message" is still the right end-state, but it can't be built before
    # Stage 4.2 (messages) exists — revisit nullability there, not here.
    title: str = Field(min_length=1, max_length=255)


class ConversationResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }