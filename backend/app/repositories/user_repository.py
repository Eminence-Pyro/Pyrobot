"""
Pyrobot — User Repository
Pure data-access layer for the User model. No business logic lives here —
only "talk to the database" operations. Isolating this makes the service
layer easy to test (the repository is the one thing you'd mock) and keeps
every User query in a single, predictable place.
"""
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create(self, *, email: str, username: str, password_hash: str) -> User:
        user = User(email=email, username=username, password_hash=password_hash)
        self.db.add(user)
        # Commits here, not in the service layer: registration is a single
        # insert with no other repository calls that need to share its
        # transaction. If a future feature needs several writes to succeed
        # or fail together, that's the signal to move the commit boundary
        # up to the service layer instead.
        await self.db.commit()
        await self.db.refresh(user)  # populates server-generated id/created_at/updated_at
        return user
