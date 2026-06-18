"""
Pyrobot — Stage 2.3 Auth Tests
Exercises the full register -> login -> /me flow against a real database
(the same one Alembic migrates). Run: pytest tests/test_auth.py -v

Note: these hit your actual dev DB directly and clean up after themselves
via the `cleanup` fixture below. A dedicated test database with transactional
rollback per test is a reasonable upgrade for a later stage — not needed yet.
"""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.main import app
from app.models.user import User


@pytest.fixture
def unique_user():
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"test_{suffix}@pyrobot.dev",
        "username": f"test_{suffix}",
        "password": "correct-horse-battery-staple",
    }


@pytest.fixture(autouse=True)
async def cleanup(unique_user):
    yield
    async with AsyncSessionLocal() as session:
        await session.execute(delete(User).where(User.email == unique_user["email"]))
        await session.commit()


@pytest.mark.asyncio
async def test_register_login_me_flow(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        register_resp = await client.post("/api/v1/auth/register", json=unique_user)
        assert register_resp.status_code == 201
        body = register_resp.json()
        assert body["email"] == unique_user["email"]
        assert "password" not in body
        assert "password_hash" not in body

        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_user["email"], "password": unique_user["password"]},
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        assert token

        me_resp = await client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == unique_user["email"]


@pytest.mark.asyncio
async def test_duplicate_email_rejected(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/register", json=unique_user)
        dup_resp = await client.post("/api/v1/auth/register", json=unique_user)
        assert dup_resp.status_code == 409


@pytest.mark.asyncio
async def test_login_wrong_password_rejected(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/api/v1/auth/register", json=unique_user)
        bad_login = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_user["email"], "password": "wrong-password"},
        )
        assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_me_without_token_rejected():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/v1/auth/me")
        assert resp.status_code == 401
