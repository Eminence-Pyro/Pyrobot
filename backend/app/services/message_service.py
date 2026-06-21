"""
Pyrobot — Message Service
Orchestrates the full "send a message" flow as a single unit of work.
Stage 4.2 is deliberately single-turn: the AI does not yet see prior
messages in the conversation when generating a reply. Multi-turn context
loading is Stage 4.3's job, by design — see the Roadmap's gate split
between 4.2 ("messages saved") and 4.3 ("AI receives reconstructed
history").
"""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.services.chat_service import ChatService


class ConversationNotFoundError(Exception):
    """Conversation doesn't exist, or isn't owned by the caller — same
    404-for-both contract as Stage 4.1's ConversationService."""
    pass


class MessageService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.conversation_repo = ConversationRepository(session)
        self.message_repo = MessageRepository(session)

    async def send_message(
        self,
        *,
        conversation_id: UUID,
        user_id: UUID,
        content: str,
        model: str,
    ) -> tuple[Message, Message]:
        """
        1. Verify ownership (reuses Stage 4.1's repository — single
           source of truth for "who owns this conversation").
        2. Stage the user's message (no commit).
        3. Call the AI provider for a reply.
        4. Stage the assistant's message (no commit).
        5. Explicitly touch conversation.updated_at.
        6. Commit everything together, exactly once.

        If step 3 raises, nothing above has been committed — the user's
        message and the failure disappear together when this request's
        DB session closes (get_db's session.close() implicitly rolls
        back an uncommitted transaction). That's correct: better to ask
        the user to resend than to leave an orphaned, unanswered message
        in their history forever.
        """
        conversation = await self.conversation_repo.get(
            conversation_id, user_id=user_id
        )
        if not conversation:
            raise ConversationNotFoundError()

        user_message = self.message_repo.stage(
            conversation_id=conversation_id,
            role="user",
            content=content,
        )

        chat_service = ChatService(model=model)
        # Single turn only — chat_service.generate() already prepends the
        # system prompt itself, so only the new user content goes in here.
        reply_content = await chat_service.generate(
            [{"role": "user", "content": content}]
        )

        assistant_message = self.message_repo.stage(
            conversation_id=conversation_id,
            role="assistant",
            content=reply_content,
        )

        # Explicit, not incidental: TimestampMixin's onupdate=func.now()
        # (models/base.py) only fires when a column ON Conversation itself
        # changes during flush. Adding child Message rows never touches
        # the parent row, so without this line, updated_at would never
        # move — silently breaking the "most recently active first"
        # ordering Stage 4.1 built.
        conversation.updated_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(user_message)
        await self.session.refresh(assistant_message)

        return user_message, assistant_message

    async def list_messages(
        self, *, conversation_id: UUID, user_id: UUID
    ) -> list[Message]:
        conversation = await self.conversation_repo.get(
            conversation_id, user_id=user_id
        )
        if not conversation:
            raise ConversationNotFoundError()

        return await self.message_repo.list_for_conversation(conversation_id)