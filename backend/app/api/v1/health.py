"""
Pyrobot — V1 Health Endpoints
"""
from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """
    Perform a system health check.
    Returns backend status, service name, and API version.
    """
    return {
        "status": "healthy",
        "service": "Pyrobot API",
        "version": "1.0.0"
    }