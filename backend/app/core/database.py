"""
Pyrobot — Database Session Management
Defines the async SQLAlchemy engine, session factory, declarative Base,
and the FastAPI dependency used to inject a DB session into routes.
"""
import sys
import asyncio

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.core.config import settings

# ── WINDOWS EVENT LOOP FIX ─────────────────────────────────────
# psycopg3's async mode is incompatible with Windows' default
# ProactorEventLoop. We switch to SelectorEventLoop, which psycopg
# (and most async libraries) support. This only affects Windows —
# Linux/macOS (e.g. our Railway production deploy) are unaffected,
# since they don't have ProactorEventLoop in the first place.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


class Base(DeclarativeBase):
    """Base class all SQLAlchemy models inherit from."""
    pass


# The engine manages a pool of connections to PostgreSQL.
# echo=False keeps SQL query logging off by default — set True temporarily
# when debugging a query, never in production (it's noisy and can leak data into logs).
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verifies a connection is alive before using it — avoids
                         # mysterious errors from stale connections after idle periods.
)

# Factory that creates new AsyncSession instances bound to our engine.
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Keeps objects usable after commit without a fresh DB hit.
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency — yields a database session for the lifetime of one request.

    Usage in a router:
        @router.get("/something")
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...

    FastAPI handles opening this at request start and ensures the `finally`
    block runs (closing the session) even if the route raises an exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()