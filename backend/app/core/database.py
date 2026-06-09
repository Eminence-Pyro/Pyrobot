"""
Pyrobot — Database Session Management
SQLAlchemy 2.x async session factory.
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


# ── ENGINE ────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,       # Set True for SQL query logging in dev
    pool_pre_ping=True,
)

# ── SESSION FACTORY ───────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── BASE MODEL ────────────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── DEPENDENCY ────────────────────────────────────────────────
async def get_db() -> AsyncSession:
    """
    FastAPI dependency — yields a database session per request.
    Usage: db: AsyncSession = Depends(get_db)
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
