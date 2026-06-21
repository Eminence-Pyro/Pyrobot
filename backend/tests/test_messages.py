"""
Pyrobot — Stage 4.2 Message Persistence Tests

DEVIATION FLAGGED: unlike Entry #010's documented chat-test convention
(mock get_provider), this file calls the real Groq API via
model="llama-3.3-70b-versatile" — free tier, no billing, already proven
reliable in the Stage 3 Addendum. This stage's actual goal is proving the
full persistence round trip (saved user message -> real AI reply ->
saved assistant message -> updated_at touched), which a mocked provider
can't demonstrate as convincingly. Paste test_chat.py if you'd rather
this match its mocking pattern exactly.

Run: pytest tests/test_messages.py -v
Requires: GROQ_API_KEY set in your .env (already is, per Stage 3).
"""
import uuid

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.main import app
from app.models.user import User

TEST_MODEL = "llama-3.3-70b-versatile"


def _make_user() -> dict:
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"msg_{suffix}@pyrobot.dev",
        "username": f"msg_{suffix}",
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

    return {"Authorization": f"Bearer {login_resp.json()['access_token']}"}


async def _create_conversation(client: AsyncClient, headers: dict, title: str) -> str:
    resp = await client.post(
        "/api/v1/conversations", headers=headers, json={"title": title}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_send_message_saves_both_and_returns_both(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Message Test")

        response = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "Reply with exactly the word: pong", "model": TEST_MODEL},
        )

        assert response.status_code == 201, response.text
        data = response.json()

        assert data["user_message"]["role"] == "user"
        assert data["user_message"]["content"] == "Reply with exactly the word: pong"
        assert data["user_message"]["conversation_id"] == conversation_id

        assert data["assistant_message"]["role"] == "assistant"
        assert len(data["assistant_message"]["content"]) > 0
        assert data["assistant_message"]["conversation_id"] == conversation_id


@pytest.mark.asyncio
async def test_send_message_requires_auth(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Auth Test")

        response = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            json={"content": "no auth", "model": TEST_MODEL},
        )

        assert response.status_code == 401


@pytest.mark.asyncio
async def test_send_message_to_nonexistent_conversation_returns_404(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        fake_id = str(uuid.uuid4())

        response = await client.post(
            f"/api/v1/conversations/{fake_id}/messages",
            headers=headers,
            json={"content": "hello", "model": TEST_MODEL},
        )

        assert response.status_code == 404


@pytest.mark.asyncio
async def test_send_message_to_other_users_conversation_returns_404(unique_user, second_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        owner_headers = await _login_headers(client, unique_user)
        other_headers = await _login_headers(client, second_user)
        conversation_id = await _create_conversation(client, owner_headers, "Private")

        response = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=other_headers,
            json={"content": "sneaky", "model": TEST_MODEL},
        )

        assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_messages_returns_saved_history_in_order(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "History Test")

        await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "first", "model": TEST_MODEL},
        )
        await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "second", "model": TEST_MODEL},
        )

        response = await client.get(
            f"/api/v1/conversations/{conversation_id}/messages", headers=headers
        )

        assert response.status_code == 200
        data = response.json()
        # 2 user + 2 assistant = 4 messages, oldest first
        assert len(data) == 4
        assert data[0]["content"] == "first"
        assert data[0]["role"] == "user"
        assert data[2]["content"] == "second"
        assert data[2]["role"] == "user"


@pytest.mark.asyncio
async def test_sending_message_updates_conversation_timestamp(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Timestamp Test")

        before = await client.get(
            f"/api/v1/conversations/{conversation_id}", headers=headers
        )
        original_updated_at = before.json()["updated_at"]

        await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "bump the timestamp", "model": TEST_MODEL},
        )

        after = await client.get(
            f"/api/v1/conversations/{conversation_id}", headers=headers
        )
        new_updated_at = after.json()["updated_at"]

        assert new_updated_at > original_updated_at


@pytest.mark.asyncio
async def test_list_messages_requires_auth(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Auth List Test")

        response = await client.get(
            f"/api/v1/conversations/{conversation_id}/messages"
        )

        assert response.status_code == 401