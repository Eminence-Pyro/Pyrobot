from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def stage(self, *, conversation_id: UUID, role: str, content: str) -> Message:
        """
        Adds a new Message to the session WITHOUT committing — deliberately
        named `stage`, not `create`, to avoid confusion with
        ConversationRepository.create(), which does commit. Saving a
        message requires multiple writes (user message + assistant
        message + conversation.updated_at) to succeed or fail together,
        so the commit boundary lives in MessageService, not here — per
        user_repository.py's own documented guidance on when to move
        commits up a layer.
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
        self.session.add(message)
        return message

    async def list_for_conversation(self, conversation_id: UUID) -> list[Message]:
        result = await self.session.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list(result.scalars().all())