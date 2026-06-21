import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class Memory(Base, TimestampMixin):
    __tablename__ = "memories"
    __table_args__ = (
        UniqueConstraint("user_id", "key", name="uq_memories_user_id_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # index=True removed — the composite UniqueConstraint above already
    # creates an index covering (user_id, key), and every real query in
    # this app filters by user_id first anyway. A standalone index on
    # `key` alone serves no query pattern this app actually has.
    key: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    value: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="memories",
    )