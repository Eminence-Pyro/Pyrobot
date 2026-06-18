"""
Pyrobot — Sprint 0 Smoke Tests
Verifies the app starts and health endpoints respond.
Run: pytest tests/test_health.py -v
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_root_returns_ok():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "Pyrobot API"


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
