"""
Pyrobot — Stage 4.1 Conversation Persistence Tests
Exercises the conversation endpoints against a real database (the same
one Alembic migrates), following the exact AsyncClient/fixture pattern
established in test_auth.py — no shared `client` fixture exists in this
project, so none is introduced here either.

Run: pytest tests/test_conversations.py -v
"""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.main import app
from app.models.user import User


def _make_user() -> dict:
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"convo_{suffix}@pyrobot.dev",
        "username": f"convo_{suffix}",
        "password": "correct-horse-battery-staple",
    }


@pytest.fixture
def unique_user():
    return _make_user()


@pytest.fixture
def second_user():
    return _make_user()


@pytest.fixture(autouse=True)
async def cleanup(unique_user, second_user):
    yield
    # Conversations cascade-delete automatically via the FK's
    # ON DELETE CASCADE (models/conversation.py) — deleting the user
    # is enough, no separate conversation cleanup needed.
    async with AsyncSessionLocal() as session:
        await session.execute(delete(User).where(User.email == unique_user["email"]))
        await session.execute(delete(User).where(User.email == second_user["email"]))
        await session.commit()


async def _login_headers(client: AsyncClient, user: dict) -> dict[str, str]:
    register_resp = await client.post("/api/v1/auth/register", json=user)
    assert register_resp.status_code == 201, register_resp.text

    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    assert login_resp.status_code == 200, login_resp.text

    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_conversation_with_title(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        response = await client.post(
            "/api/v1/conversations",
            headers=headers,
            json={"title": "My First Chat"},
        )

        assert response.status_code == 201, response.text
        data = response.json()
        assert data["title"] == "My First Chat"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_conversation_without_title_fails(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        response = await client.post(
            "/api/v1/conversations",
            headers=headers,
            json={},
        )

        # title is required — matches models/conversation.py's nullable=False.
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_conversation_requires_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/conversations",
            json={"title": "No Auth"},
        )

        assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_conversations_returns_users_conversations(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        first = await client.post(
            "/api/v1/conversations", headers=headers, json={"title": "First"}
        )
        second = await client.post(
            "/api/v1/conversations", headers=headers, json={"title": "Second"}
        )
        assert first.status_code == 201, first.text
        assert second.status_code == 201, second.text

        response = await client.get("/api/v1/conversations", headers=headers)
        assert response.status_code == 200

        data = response.json()
        ids = [c["id"] for c in data]
        assert first.json()["id"] in ids
        assert second.json()["id"] in ids

        # Most recently active first — "Second" was created after "First",
        # so it must appear earlier in the list (updated_at DESC).
        assert ids.index(second.json()["id"]) < ids.index(first.json()["id"])


@pytest.mark.asyncio
async def test_get_own_conversation(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        created = await client.post(
            "/api/v1/conversations", headers=headers, json={"title": "Fetch Me"}
        )
        conversation_id = created.json()["id"]

        response = await client.get(
            f"/api/v1/conversations/{conversation_id}", headers=headers
        )

        assert response.status_code == 200
        assert response.json()["id"] == conversation_id
        assert response.json()["title"] == "Fetch Me"


@pytest.mark.asyncio
async def test_get_nonexistent_conversation_returns_404(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        fake_id = str(uuid.uuid4())
        response = await client.get(
            f"/api/v1/conversations/{fake_id}", headers=headers
        )

        assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_other_users_conversation_returns_404(unique_user, second_user):
    """
    The core ownership-enforcement test: a conversation that exists but
    belongs to someone else must return 404 — not 403 — per the
    documented decision in Master Document §4.4 (never confirm a
    resource's existence to a non-owner).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_headers = await _login_headers(client, unique_user)
        other_headers = await _login_headers(client, second_user)

        created = await client.post(
            "/api/v1/conversations", headers=owner_headers, json={"title": "Private"}
        )
        conversation_id = created.json()["id"]

        response = await client.get(
            f"/api/v1/conversations/{conversation_id}", headers=other_headers
        )

        assert response.status_code == 404