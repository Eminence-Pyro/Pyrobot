from uuid import UUID

from app.models.memory import Memory
from app.repositories.memory_repository import MemoryRepository
from sqlalchemy.ext.asyncio import AsyncSession


class MemoryService:
    def __init__(self, session: AsyncSession):
        self.repository = MemoryRepository(session)

    async def set_memory(self, *, user_id: UUID, key: str, value: dict) -> Memory:
        return await self.repository.upsert(user_id=user_id, key=key, value=value)

    async def get_all_memory(self, *, user_id: UUID) -> list[Memory]:
        return await self.repository.list_for_user(user_id)

    async def delete_memory(self, *, user_id: UUID, key: str) -> bool:
        return await self.repository.delete_by_key(user_id=user_id, key=key)

    async def clear_memory(self, *, user_id: UUID) -> int:
        return await self.repository.delete_all_for_user(user_id)

    async def build_context_string(self, *, user_id: UUID) -> str | None:
        """
        Used internally by MessageService to inject memory into the AI's
        system prompt (Master Doc §2.6, Layers 2-3). Not exposed via any
        API endpoint directly — returns None if the user has no stored
        memory, so callers can skip injection entirely rather than
        sending an empty/meaningless context block.
        """
        memories = await self.repository.list_for_user(user_id)
        if not memories:
            return None

        lines = [f"- {m.key}: {m.value}" for m in memories]
        return (
            "Known user context (remembered from previous interactions):\n"
            + "\n".join(lines)
        )