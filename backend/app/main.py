"""
Pyrobot — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="Pyrobot API",
    description="Your AI. Your Way. — Pyrobot backend API.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ───────────────────────────────────────────────────
# Uncomment as each router is built in subsequent stages
# from app.api import auth, chat, memory, upload
# app.include_router(auth.router,   prefix="/api/v1/auth",   tags=["auth"])
# app.include_router(chat.router,   prefix="/api/v1/chat",   tags=["chat"])
# app.include_router(memory.router, prefix="/api/v1/memory", tags=["memory"])
# app.include_router(upload.router, prefix="/api/v1/upload", tags=["upload"])


# ── HEALTH CHECK ──────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "Pyrobot API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
