"""
Pyrobot — Auth Service
Business logic for registration and login. Routers call into this layer;
this layer calls the repository. No HTTP concerns (status codes, headers)
belong here — only domain logic and the exceptions describing what went wrong.
The router is what translates these exceptions into HTTP responses.
"""
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository


class EmailAlreadyRegisteredError(Exception):
    """Raised when attempting to register an email that already exists."""


class UsernameAlreadyTakenError(Exception):
    """Raised when attempting to register a username that already exists."""


class InvalidCredentialsError(Exception):
    """Raised when login email/password don't match a real, active user."""


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register_user(self, *, email: str, username: str, password: str) -> User:
        if await self.repo.get_by_email(email) is not None:
            raise EmailAlreadyRegisteredError(email)
        if await self.repo.get_by_username(username) is not None:
            raise UsernameAlreadyTakenError(username)

        password_hash = hash_password(password)
        return await self.repo.create(email=email, username=username, password_hash=password_hash)

    async def authenticate_user(self, *, email: str, password: str) -> User:
        user = await self.repo.get_by_email(email)
        # Deliberately the same error for "no such user" and "wrong password" —
        # telling an attacker which one it was confirms whether an email is
        # registered at all. (Note: this implementation isn't constant-time
        # end-to-end since verify_password is skipped entirely when user is
        # None — fine for V1, worth hardening later if this app handles
        # higher-stakes accounts.)
        if user is None or not user.is_active:
            raise InvalidCredentialsError(email)
        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError(email)
        return user

    def create_token_for_user(self, user: User) -> str:
        return create_access_token(subject=str(user.id))
