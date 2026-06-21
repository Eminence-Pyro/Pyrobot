"""
Pyrobot — Stage 4.4 Memory System Tests
Covers CRUD on /api/v1/memory, and proves memory actually influences AI
responses through /conversations/{id}/messages — not just that values
get stored. Same unguessable-nonce strategy as Stage 4.3's context test.

Run: pytest tests/test_memory.py -v
Requires: GROQ_API_KEY set (real Groq call in the influence test).
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
        "email": f"mem_{suffix}@pyrobot.dev",
        "username": f"mem_{suffix}",
        "password": "correct-horse-battery-staple",
    }


@pytest.fixture
def unique_user():
    return _make_user()


@pytest.fixture(autouse=True)
async def cleanup(unique_user):
    yield
    async with AsyncSessionLocal() as session:
        await session.execute(delete(User).where(User.email == unique_user["email"]))
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


@pytest.mark.asyncio
async def test_set_memory_creates_key(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        response = await client.put(
            "/api/v1/memory/learning_goal",
            headers=headers,
            json={"value": {"text": "Master React and TypeScript"}},
        )

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["key"] == "learning_goal"
        assert data["value"] == {"text": "Master React and TypeScript"}


@pytest.mark.asyncio
async def test_set_memory_on_existing_key_updates_not_duplicates(unique_user):
    """
    The core proof that this stage's schema fix actually works: writing
    the same key twice must produce exactly ONE row, second value
    winning — not two rows, and not a crash reading them back.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        first = await client.put(
            "/api/v1/memory/tone", headers=headers, json={"value": {"text": "formal"}}
        )
        assert first.status_code == 200, first.text

        second = await client.put(
            "/api/v1/memory/tone", headers=headers, json={"value": {"text": "casual"}}
        )
        assert second.status_code == 200, second.text

        all_memory = await client.get("/api/v1/memory", headers=headers)
        assert all_memory.status_code == 200

        tone_entries = [m for m in all_memory.json() if m["key"] == "tone"]
        assert len(tone_entries) == 1
        assert tone_entries[0]["value"] == {"text": "casual"}


@pytest.mark.asyncio
async def test_get_all_memory_requires_auth():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/memory")
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_delete_memory_by_key(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        await client.put(
            "/api/v1/memory/temp_key",
            headers=headers,
            json={"value": {"text": "delete me"}},
        )

        delete_resp = await client.delete("/api/v1/memory/temp_key", headers=headers)
        assert delete_resp.status_code == 204

        all_memory = await client.get("/api/v1/memory", headers=headers)
        keys = [m["key"] for m in all_memory.json()]
        assert "temp_key" not in keys


@pytest.mark.asyncio
async def test_delete_nonexistent_key_returns_404(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        response = await client.delete("/api/v1/memory/never_existed", headers=headers)
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_clear_all_memory(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        await client.put("/api/v1/memory/key_one", headers=headers, json={"value": {"text": "a"}})
        await client.put("/api/v1/memory/key_two", headers=headers, json={"value": {"text": "b"}})

        clear_resp = await client.delete("/api/v1/memory", headers=headers)
        assert clear_resp.status_code == 204

        all_memory = await client.get("/api/v1/memory", headers=headers)
        assert all_memory.json() == []


@pytest.mark.asyncio
async def test_memory_influences_ai_response(unique_user):
    """
    Proves Master Doc §2.6 Layers 2-3 are genuinely wired through
    MessageService -> ChatService -> the AI provider, not just stored
    inertly. A fabricated pet name can only appear in the reply if
    memory was actually loaded and injected into the system prompt.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)

        secret_pet_name = f"Zorbnax{uuid.uuid4().hex[:6]}"
        await client.put(
            "/api/v1/memory/pet_name",
            headers=headers,
            json={"value": {"text": f"The user's pet is named {secret_pet_name}"}},
        )

        conv_resp = await client.post(
            "/api/v1/conversations", headers=headers, json={"title": "Memory Test"}
        )
        conversation_id = conv_resp.json()["id"]

        response = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={
                "content": "What is my pet's name? Reply with only the name.",
                "model": TEST_MODEL,
            },
        )
        assert response.status_code == 201, response.text

        reply = response.json()["assistant_message"]["content"]
        assert secret_pet_name.lower() in reply.lower(), (
            f"Expected '{secret_pet_name}' in reply, got: {reply!r}"
        )