"""
Pyrobot — Message Service
Orchestrates the full "send a message" flow as a single unit of work.

Stage 4.3: multi-turn context is now reconstructed from persisted history
before calling the AI provider — Layer 4 of the prompt system documented
in Master Document §2.6 ("Conversation History — last N messages").
Capped, not unlimited: unbounded history would grow every provider's
token cost and latency linearly with conversation length. Smarter
truncation/summarization is a real future improvement, not needed for V1.
"""
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.message_repository import MessageRepository
from app.services.chat_service import ChatService

# Master Document §2.6, Layer 4: "Conversation History (last N messages)".
# 20 is a deliberately simple starting cap — generous for normal
# back-and-forth, predictable in token cost. Revisit once real usage data
# shows it's actually too small or unnecessarily large.
MAX_HISTORY_MESSAGES = 20


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
        1. Verify ownership.
        2. Load prior history BEFORE staging the new message, capped to
           the most recent MAX_HISTORY_MESSAGES turns.
        3. Stage the new user message (no commit yet).
        4. Call the AI provider with prior history + the new user turn.
        5. Stage the assistant's reply (no commit yet).
        6. Explicitly touch conversation.updated_at.
        7. Commit everything together, exactly once.

        Why history is loaded BEFORE staging the new message: stage()
        only adds to the session, it doesn't flush. Loading history first
        means there's exactly one explicit source of truth for "what's
        prior" vs. "what's new" — not one that implicitly depends on
        SQLAlchemy's autoflush timing.

        If step 4 raises, nothing above has been committed — same
        failure-safety guarantee Stage 4.2 established.
        """
        conversation = await self.conversation_repo.get(
            conversation_id, user_id=user_id
        )
        if not conversation:
            raise ConversationNotFoundError()

        prior_messages = await self.message_repo.list_for_conversation(
            conversation_id
        )
        recent_history = prior_messages[-MAX_HISTORY_MESSAGES:]
        history = [
            {"role": m.role, "content": m.content} for m in recent_history
        ]

        user_message = self.message_repo.stage(
            conversation_id=conversation_id,
            role="user",
            content=content,
        )

        chat_service = ChatService(model=model)
        reply_content = await chat_service.generate(
            history + [{"role": "user", "content": content}]
        )

        assistant_message = self.message_repo.stage(
            conversation_id=conversation_id,
            role="assistant",
            content=reply_content,
        )

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