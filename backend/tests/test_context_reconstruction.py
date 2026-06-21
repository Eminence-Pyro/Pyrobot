"""
Pyrobot — Stage 4.3 Context Reconstruction Tests
Proves multi-turn conversations actually carry context, not just that
messages persist (Stage 4.2 already proved that). Uses an unguessable
nonce word planted in turn one and requested back in turn two — the only
way it can appear in the reply is if history was genuinely reconstructed
and sent to the provider.

Run: pytest tests/test_context_reconstruction.py -v
Requires: GROQ_API_KEY set (same as test_messages.py — real Groq calls).
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
        "email": f"ctx_{suffix}@pyrobot.dev",
        "username": f"ctx_{suffix}",
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


async def _create_conversation(client: AsyncClient, headers: dict, title: str) -> str:
    resp = await client.post(
        "/api/v1/conversations", headers=headers, json={"title": title}
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_second_message_receives_first_messages_context(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Context Test")

        # Unguessable nonce — not a real word, can't be produced by chance
        # or by general world knowledge. Only true context-passing can
        # reproduce it in turn two.
        secret_word = f"zylophant{uuid.uuid4().hex[:6]}"

        first = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={
                "content": f"Remember this secret word: {secret_word}. Just reply OK.",
                "model": TEST_MODEL,
            },
        )
        assert first.status_code == 201, first.text

        second = await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={
                "content": "What was the secret word I just told you? Reply with only that word, nothing else.",
                "model": TEST_MODEL,
            },
        )
        assert second.status_code == 201, second.text

        reply = second.json()["assistant_message"]["content"].lower()
        assert secret_word.lower() in reply, (
            f"Expected '{secret_word}' in reply, got: {reply!r}"
        )


@pytest.mark.asyncio
async def test_multi_turn_history_persists_in_correct_order(unique_user):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await _login_headers(client, unique_user)
        conversation_id = await _create_conversation(client, headers, "Order Test")

        await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "turn one", "model": TEST_MODEL},
        )
        await client.post(
            f"/api/v1/conversations/{conversation_id}/messages",
            headers=headers,
            json={"content": "turn two", "model": TEST_MODEL},
        )

        response = await client.get(
            f"/api/v1/conversations/{conversation_id}/messages", headers=headers
        )
        assert response.status_code == 200

        data = response.json()
        # 2 user + 2 assistant = 4, still correctly ordered after the
        # multi-turn code path (regression check on Stage 4.2's behavior)
        assert len(data) == 4
        assert data[0]["content"] == "turn one"
        assert data[0]["role"] == "user"
        assert data[2]["content"] == "turn two"
        assert data[2]["role"] == "user"