from uuid import UUID

from sqlalchemy import delete as sa_delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.memory import Memory


class MemoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert(self, *, user_id: UUID, key: str, value: dict) -> Memory:
        """
        Atomic create-or-update on (user_id, key) via Postgres's native
        INSERT ... ON CONFLICT — relies on the UniqueConstraint added in
        this stage's migration. A single round trip, race-condition-safe
        by construction: two simultaneous PUTs to the same key can't
        both "win" a check-then-write race, because there's no separate
        check — the database resolves the conflict atomically.

        Commits directly here (not in the service layer): this is a
        single, standalone operation with no other repository call that
        needs to share its transaction — same rule user_repository.py's
        create() established in Stage 2.3.
        """
        stmt = (
            pg_insert(Memory)
            .values(user_id=user_id, key=key, value=value)
            .on_conflict_do_update(
                index_elements=["user_id", "key"],
                set_={"value": value},
            )
            .returning(Memory)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalar_one()

    async def list_for_user(self, user_id: UUID) -> list[Memory]:
        result = await self.session.execute(
            select(Memory).where(Memory.user_id == user_id).order_by(Memory.key)
        )
        return list(result.scalars().all())

    async def delete_by_key(self, *, user_id: UUID, key: str) -> bool:
        result = await self.session.execute(
            sa_delete(Memory).where(Memory.user_id == user_id, Memory.key == key)
        )
        await self.session.commit()
        return result.rowcount > 0

    async def delete_all_for_user(self, user_id: UUID) -> int:
        result = await self.session.execute(
            sa_delete(Memory).where(Memory.user_id == user_id)
        )
        await self.session.commit()
        return result.rowcount