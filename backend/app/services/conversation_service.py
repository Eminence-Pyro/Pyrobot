from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation
from app.repositories.conversation_repository import (
    ConversationRepository,
)


class ConversationService:
    def __init__(self, session: AsyncSession):
        self.repository = ConversationRepository(session)

    async def create_conversation(
        self,
        *,
        user_id: UUID,
        title: str,
    ) -> Conversation:
        return await self.repository.create(
            user_id=user_id,
            title=title,
        )

    async def get_conversation(
        self,
        *,
        conversation_id: UUID,
        user_id: UUID,
    ) -> Conversation | None:
        conversation = await self.repository.get(
            conversation_id
        )

        if not conversation:
            return None

        if conversation.user_id != user_id:
            return None

        return conversation

    async def list_conversations(
        self,
        *,
        user_id: UUID,
    ) -> list[Conversation]:
        return await self.repository.list_for_user(
            user_id
        )