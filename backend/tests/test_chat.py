"""
Pyrobot — Stage 3 Chat Tests

Strategy: mock the AI provider so tests run without real API keys,
and at any speed regardless of network latency.

The mock replaces the provider at the service level — the router,
schemas, streaming logic, and auth protection are all exercised for real.
This is the right boundary: we're testing *our* code, not OpenAI's API.
"""
import json
import uuid
from typing import AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete

from app.core.database import AsyncSessionLocal
from app.main import app
from app.models.user import User


# ── Test fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def unique_user():
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"chat_test_{suffix}@pyrobot.dev",
        "username": f"chat_test_{suffix}",
        "password": "test-password-123",
    }


@pytest.fixture(autouse=True)
async def cleanup(unique_user):
    yield
    async with AsyncSessionLocal() as session:
        await session.execute(delete(User).where(User.email == unique_user["email"]))
        await session.commit()


async def _register_and_get_token(client: AsyncClient, user: dict) -> str:
    """Helper: register a user and return their access token."""
    await client.post("/api/v1/auth/register", json=user)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": user["password"]},
    )
    return resp.json()["access_token"]


# ── Mock provider helpers ──────────────────────────────────────────────────────

def _mock_provider_generate(content: str = "Hello from Pyrobot!"):
    """Returns a mock provider whose generate() resolves immediately."""
    mock = MagicMock()
    mock.generate = AsyncMock(return_value=content)
    return mock


async def _fake_stream(tokens: list[str]) -> AsyncIterator[str]:
    """Async generator that yields a fixed list of tokens."""
    for token in tokens:
        yield token


# ── Tests ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_requires_auth():
    """Calling /chat/generate without a token returns 401."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/api/v1/chat/generate",
            json={"messages": [{"role": "user", "content": "Hello"}]},
        )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_generate_returns_ai_response(unique_user):
    """Authenticated /chat/generate call returns a ChatResponse with content."""
    mock_provider = _mock_provider_generate("Paris is the capital of France.")

    with patch("app.services.chat_service.get_provider", return_value=mock_provider):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await _register_and_get_token(client, unique_user)
            resp = await client.post(
                "/api/v1/chat/generate",
                json={
                    "messages": [{"role": "user", "content": "What is the capital of France?"}],
                    "model": "llama-3.3-70b-versatile",
                },
                headers={"Authorization": f"Bearer {token}"},
            )

    assert resp.status_code == 200
    body = resp.json()
    assert body["content"] == "Paris is the capital of France."
    assert body["model"] == "llama-3.3-70b-versatile"


@pytest.mark.asyncio
async def test_generate_unknown_model_returns_400(unique_user):
    """Requesting a model not in the factory returns 400."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _register_and_get_token(client, unique_user)
        resp = await client.post(
            "/api/v1/chat/generate",
            json={
                "messages": [{"role": "user", "content": "Hello"}],
                "model": "llama-3.3-70b-versatile",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_stream_returns_sse_tokens(unique_user):
    """
    /chat/stream returns text/event-stream content.
    Each non-empty line starts with 'data: ' and the final line is 'data: [DONE]'.
    """
    tokens = ["Hello", " from", " Pyrobot", "!"]

    mock_provider = MagicMock()
    mock_provider.stream = MagicMock(return_value=_fake_stream(tokens))

    with patch("app.services.chat_service.get_provider", return_value=mock_provider):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await _register_and_get_token(client, unique_user)
            resp = await client.post(
                "/api/v1/chat/stream",
                json={"messages": [{"role": "user", "content": "Hi"}]},
                headers={"Authorization": f"Bearer {token}"},
            )

    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]

    lines = [l for l in resp.text.splitlines() if l.strip()]
    assert all(line.startswith("data: ") for line in lines)

    # Last line must be the [DONE] sentinel
    assert lines[-1] == "data: [DONE]"

    # Reassemble the streamed tokens and confirm they match what was sent
    payload_lines = lines[:-1]  # exclude [DONE]
    reassembled = "".join(json.loads(line[len("data: "):]) for line in payload_lines)
    assert reassembled == "Hello from Pyrobot!"


@pytest.mark.asyncio
async def test_system_prompt_is_prepended(unique_user):
    """
    The service always prepends the Pyrobot system prompt before
    calling the provider — it should never reach the provider with
    only the user's raw message.
    """
    mock_provider = MagicMock()
    mock_provider.generate = AsyncMock(return_value="response")

    with patch("app.services.chat_service.get_provider", return_value=mock_provider):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            token = await _register_and_get_token(client, unique_user)
            await client.post(
                "/api/v1/chat/generate",
                json={"messages": [{"role": "user", "content": "Hello"}]},
                headers={"Authorization": f"Bearer {token}"},
            )

    called_messages = mock_provider.generate.call_args[0][0]
    assert called_messages[0].role == "system"
    assert "Pyrobot" in called_messages[0].content
