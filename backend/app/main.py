"""
Pyrobot — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import health  # Import your health module

app = FastAPI(
    title="Pyrobot API",
    description="Your AI. Your Way. — Pyrobot backend API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS MIDDLEWARE ───────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── BASE ROOT ─────────────────────────────────────────────────
@app.get("/", tags=["root"])
async def root():
    return {"status": "ok", "service": "Pyrobot API", "version": "1.0.0"}


# ── ROUTERS ───────────────────────────────────────────────────
# Include the clean v1 health router with the global v1 prefix
app.include_router(health.router, prefix="/api/v1")


# Future integrations:
# from app.api.v1 import auth, chat, memory, files
# app.include_router(auth.router,   prefix="/api/v1/auth",   tags=["auth"])
# app.include_router(chat.router,   prefix="/api/v1/chat",   tags=["chat"])
# app.include_router(memory.router, prefix="/api/v1/memory", tags=["memory"])
# app.include_router(files.router,  prefix="/api/v1/files",  tags=["files"])