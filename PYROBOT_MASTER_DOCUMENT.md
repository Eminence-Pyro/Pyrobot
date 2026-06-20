# PYROBOT — MASTER PROJECT DOCUMENT

**Version:** 2.0 — supersedes v1.0 (original .docx)
**Status:** Active Development
**Date:** June 2026
**Owner:** Eminence
**Stack:** Next.js 16.2.6 · FastAPI · PostgreSQL 17 · Multi-provider AI

> **What changed in v2.0:** reconciled against what's actually built
> (PROJECT_JOURNAL.md Entries #001–#011), not just what was planned.
> Stage-by-stage tracking has moved to `PYROBOT_EXECUTION_ROADMAP.md` —
> this document no longer duplicates it. Tech stack, model names, and the
> AI abstraction layer are updated to current reality.

---

## 1. Product Vision & Requirements

### 1.1 Vision Statement

Pyrobot is a Personal AI Operating System — a trusted companion that
understands user goals, remembers relevant context, assists with learning
and software development, and gradually evolves into an action-oriented
assistant.

*"Your AI. Your Way."* — Pyrobot helps users think, learn, create, organize,
and take action through a single unified intelligent interface.

### 1.2 The Problem We Are Solving

| Tool Category | Current App | Pyrobot Replaces It With |
|---|---|---|
| AI Chat | ChatGPT / Gemini | Built-in AI with memory and personality |
| Note-taking | Notion / Apple Notes | AI-summarized, searchable notes |
| Task Management | Todoist / Reminders | AI-aware tasks with smart reminders |
| Study Tools | Anki / Quizlet | Auto-generated flashcards and quizzes |
| Code Assistant | GitHub Copilot | Integrated code generation + debug |
| Research | Google / Perplexity | AI research agent with source memory |

### 1.3 Target Users

**Primary: Students** — research assistance, assignment planning, exam
prep with AI-generated flashcards, study scheduling.

**Secondary: Developers** — code generation, debugging, project planning,
documentation generation.

**Future: Professionals & Entrepreneurs** — task management, workflow
automation, communication support.

### 1.4 Core Product Pillars

| Pillar | Description | Status |
|---|---|---|

| Conversation | Natural AI chat via text, voice (future), file uploads | ✅ Active |
| Memory | Persistent recall of preferences, projects, learning goals | ⏳ Stage 4.4 |
| Productivity | Notes, tasks, reminders, calendar integration | Stage 7 |
| Creation | Writing, research, coding, website generation | Stage 7 |
| Action | Calendar actions, email workflows, task automation | Stage 7 |

### 1.5 Version Roadmap

For stage-by-stage execution tracking, see **`PYROBOT_EXECUTION_ROADMAP.md`**.
This section maps long-term product versions to that execution plan:

| Version | Title | Roadmap Stages | Core Goal |
|---|---|---|---|
| V1 | AI Assistant | Stages 1–6 | Useful personal assistant — auth, chat, memory, persistence, UI |
| V2 | Productivity | Stage 7 (partial) | Tasks, notes, reminders, calendar, flashcards |
| V3 | Dev Assistant | Stage 7 (partial) | Code gen, project builder, GitHub integration |
| V4 | Automation Agent | Stage 7 (partial) | Gmail, Calendar, WhatsApp, workflow builder |
| V5 | AI OS | Stage 7 (partial) | Multi-agent: Research, Study, Dev, Productivity, Comms |

### 1.6 V1 MVP Scope

**✅ Included in V1**
Authentication · AI Chat with streaming · Conversation history (saved,
searchable) · User memory (light) · File upload + PDF summarization ·
Web search (optional) · Glassmorphism UI (light/dark) · Mobile-first layout

**🚫 Excluded from V1**
WhatsApp/Telegram integration · Email automation · Google Calendar sync ·
Multi-agent architecture · Autonomous actions without approval · App store
deployment (web-first)

### 1.7 Success Metrics

| Version | Metric | Target |
|---|---|---|
| V1 | Daily Active Users | Baseline — track from day 1 |
| V1 | Avg conversations/day | 3+ per active user |
| V1 | Retention (7-day) | 40%+ |
| V2 | Tasks created | 5+ per active user/week |

---

## 2. System Architecture

### 2.1 Architecture Overview

Pyrobot uses a decoupled architecture: a Next.js frontend communicates
with a FastAPI backend through REST + Server-Sent Events. The AI layer is
fully abstracted via the Strategy Pattern — **verified in production
across four real providers** (Stage 3 Addendum, June 2026).

┌─────────────────────────────────────────────────────────┐

│                    USER (Browser / PWA)                  │

└───────────────────────────┬─────────────────────────────┘

│  HTTPS / SSE

┌───────────────────────────▼─────────────────────────────┐

│              NEXT.JS FRONTEND (Vercel)                   │

│   App Router · TypeScript · Tailwind · Zustand           │

└───────────────────────────┬─────────────────────────────┘

│  REST API calls

┌───────────────────────────▼─────────────────────────────┐

│              FASTAPI BACKEND (Railway)                   │

│   Routers · Services · Repositories · JWT Auth           │

│         ┌─────────────────┼──────────────┐               │

│         ▼                 ▼              ▼               │

│   AI Service Layer  Conversation/    Memory Engine        │

│   (Provider Pattern) Message Layer   (Stage 4.4)          │

│         │                                                 │

│    ┌────┴──────────────────────────────────┐              │

│    │ GPT-5.5 / Claude Sonnet 4.6 /          │              │

│    │ Gemini 2.5 Flash / Groq Llama 3.3      │  ← swappable │

│    └─────────────────────────────────────────┘              │

└───────────────────────────┬─────────────────────────────┘

│

┌───────────────────────────▼─────────────────────────────┐

│              POSTGRESQL 17 DATABASE                       │

│   users · conversations · messages · memories · files     │

└─────────────────────────────────────────────────────────┘

### 2.2 Technology Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend Framework | **Next.js 16.2.6** (App Router) | Scaffolded, Stage 5.1 pending |
| UI Styling | Tailwind CSS + CSS Variables | Pending |
| Language (FE) | TypeScript | Configured |
| State Management | Zustand | Pending |
| UI Components | shadcn/ui (Vega preset) | Initialized |
| Backend Framework | FastAPI (Python 3.12+) | ✅ Live |
| Database | PostgreSQL 17 (Docker) | ✅ Live |
| ORM | SQLAlchemy 2.0 async + Alembic | ✅ Live |
| DB Driver | psycopg3 (`psycopg[binary]`) — **not asyncpg** | ✅ Live |
| Authentication | JWT (access token) + Argon2 | ✅ Live |
| Auth header scheme | `HTTPBearer` — **not** `OAuth2PasswordBearer` | ✅ Live |
| AI Layer | Provider Pattern — 4 providers live | ✅ Live |
| File Storage | Local (dev) → S3 (prod) | Stage 7 |
| Deployment (FE) | Vercel | Stage 6 |
| Deployment (BE) | Railway | Stage 6 |

### 2.3 Frontend Folder Structure

*(unchanged from original scaffold — see repo `frontend/src/`)*

frontend/src/

├── app/

│   ├── (auth)/              ← welcome, login, signup

│   ├── (dashboard)/         ← home, chat/[id], history, settings

│   ├── layout.tsx

│   └── globals.css

├── components/

│   ├── ui/                  ← Button, GlassCard, InputBar, Badge

│   ├── chat/

│   ├── layout/               ← TopBar, BottomNavBar

│   └── providers/            ← ThemeProvider

├── hooks/                    ← useChat, useStream, useTheme, useAuth

├── services/

│   └── api.ts

├── store/                    ← chatStore, userStore, themeStore

└── types/

### 2.4 Backend Folder Structure (current, as built)

backend/app/

├── api/

│   ├── v1/

│   │   ├── auth.py           ✅

│   │   ├── chat.py           ✅

│   │   ├── conversations.py  ⏳ Stage 4.1

│   │   └── health.py         ✅

│   └── deps.py               ✅ get_current_user

├── core/

│   ├── config.py              ✅

│   ├── database.py            ✅

│   └── security.py            ✅ Argon2 + JWT

├── models/

│   ├── user.py / conversation.py / message.py / memory.py   ✅

├── repositories/

│   ├── user_repository.py     ✅

│   └── conversation_repository.py  ⏳ Stage 4.1 (pending review)

├── schemas/

│   ├── auth.py / chat.py / conversation.py / health.py

├── services/

│   ├── ai/

│   │   ├── base.py            ✅ AIProvider ABC

│   │   ├── factory.py         ✅ Strategy Pattern

│   │   ├── openai_provider.py    ✅ gpt-5.5, gpt-5.4-mini

│   │   ├── claude_provider.py    ✅ claude-sonnet-4-6, claude-haiku-4-5

│   │   ├── gemini_provider.py    ✅ gemini-2.5-flash(-lite), google-genai SDK

│   │   └── groq_provider.py      ✅ llama-3.3-70b-versatile, llama-3.1-8b-instant

│   ├── auth_service.py        ✅

│   ├── chat_service.py        ✅

│   └── conversation_service.py  ⏳ Stage 4.1

└── main.py

### 2.5 AI Abstraction Layer — The Provider Pattern

This remains the most important architectural decision in Pyrobot, and is
now **verified working across four real providers**, not just designed
on paper.

```python
# app/services/ai/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator

@dataclass
class ChatMessage:
    role: str   # "user" | "assistant" | "system"
    content: str

class AIProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[ChatMessage]) -> str: ...

    @abstractmethod
    def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]: ...
```

```python
# app/services/ai/factory.py — current registered models
providers: dict[str, Any] = {
    "gpt-5.5":                     OpenAIProvider,
    "gpt-5.4-mini":                OpenAIProvider,
    "claude-sonnet-4-6":           ClaudeProvider,
    "claude-haiku-4-5-20251001":   ClaudeProvider,
    "gemini-2.5-flash":            GeminiProvider,
    "gemini-2.5-flash-lite":       GeminiProvider,
    "llama-3.3-70b-versatile":     GroqProvider,
    "llama-3.1-8b-instant":        GroqProvider,
}
```

**Key Insight:** *To add a new model: one file + one factory entry. Zero
UI changes. Proven in practice when Groq was added in under an hour
(Entry #011).*

**Gemini-specific note:** uses the unified `google-genai` SDK (the older
`google.generativeai` package was deprecated August 2025). Stateless by
design — full conversation history is sent as `contents` on every call,
matching Pyrobot's own stateless chat architecture rather than simulating
a server-side session.

### 2.6 Prompt Engineering System

*(unchanged — not yet wired to live memory/history; becomes fully active
in Stage 4.3)*

LAYER 1 — Base Personality (always present)

LAYER 2 — User Profile (injected from DB, Stage 4.4)

LAYER 3 — Relevant Memory Snippets (Stage 4.4)

LAYER 4 — Conversation History (Stage 4.3)

LAYER 5 — Current User Message

### 2.7 Security Model

| Concern | Approach | Status |
|---|---|---|
| Password storage | Argon2 (not bcrypt — memory-hard, GPU-resistant) | ✅ |
| Authentication | JWT access token (15 min); refresh deferred to Stage 6 | ✅ |
| API protection | All dashboard routes require valid Bearer token via `HTTPBearer` | ✅ |
| Data isolation | Every DB query filters by `user_id` | ⚠️ Partial — see §4.4 |
| Memory control | User can view/edit/delete stored memory | Stage 4.4 |
| File security | UUID filenames, no predictable paths | Stage 7 |
| SQL injection | SQLAlchemy ORM only, no raw SQL with user input | ✅ |
| CORS | Whitelist frontend domain only | ✅ |

### 2.8 Deployment Strategy

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| Development | localhost:3000 (`next dev`) | localhost:8000 (`uvicorn`) | Docker PostgreSQL 17 |
| Production | Vercel | Railway | Railway PostgreSQL |

---

## 3. Database Design

*(Schema unchanged from v1.0 — already migrated and live since Entry #007/#008.
No new migrations required for Stage 4.1–4.4; the tables already exist.)*

### 3.1 Design Principles

UUID primary keys · audit timestamps (`created_at`/`updated_at`) · cascade
deletes · indexed foreign keys · application-layer `user_id` isolation ·
ORM only · V1 uses hard deletes (soft-delete deferred to V2).

### 3.2 Entity Relationship Diagram

users

├──< conversations  (user_id FK)

│         └──< messages  (conversation_id FK)

├──< memories  (user_id FK)  ← key-value store

└──< files  (user_id FK)

└──< file_summaries  (file_id FK)

### 3.3 Full SQL Schema

*(unchanged — see original schema; `conversations.updated_at` and
`conversations.title` nullability are already correctly defined and
**drive the API contract decisions in §4.4 below**.)*

### 3.4 Common Query Patterns

```sql
-- Load all conversations for a user, most RECENTLY ACTIVE first
SELECT c.*, COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.user_id = :user_id
GROUP BY c.id
ORDER BY c.updated_at DESC;   -- NOT created_at — see §4.4 decision
```

```sql
-- Always validate ownership at the query layer, not just the service layer
SELECT * FROM conversations
WHERE id = :conversation_id AND user_id = :user_id;
```

---

## 4. API Contract Specification

### 4.1 Standards

| Standard | Value |
|---|---|
| Base URL | `/api/v1` |
| Auth method | Bearer JWT — `Authorization: Bearer <token>` |
| Response format | JSON — `{ success, data }` or `{ success, error }` |
| Streaming format | SSE — `text/event-stream` |
| Versioning | Breaking changes → `/api/v2` |

### 4.2 Auth Endpoints — ✅ Live

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Returns access JWT |
| GET | `/auth/me` | Yes | Current user profile |

### 4.3 Chat Endpoints — ✅ Live

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/chat/stream` | Yes | SSE streaming response |
| POST | `/chat/generate` | Yes | Full JSON response |

**Current valid `model` values:** `gpt-5.5`, `gpt-5.4-mini`,
`claude-sonnet-4-6`, `claude-haiku-4-5-20251001`, `gemini-2.5-flash`,
`gemini-2.5-flash-lite`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`.

### 4.4 Conversation Endpoints — ⏳ Stage 4.1

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/conversations` | Yes | Create new conversation |
| GET | `/conversations` | Yes | List user's conversations |
| GET | `/conversations/{id}` | Yes | Get single conversation |

**📌 Decision — `title` is optional at creation.**
The SQL schema already allows `NULL` (no `NOT NULL` constraint). This
matches the standard chat-app UX (ChatGPT, Claude.ai): a conversation is
created the moment a user starts typing, and gets auto-titled from the
first exchange afterward — not before. `ConversationCreate.title` should
be `str | None = None`, not a required field.

**📌 Decision — 404 for both "not found" and "not yours."**
`GET /conversations/{id}` returns `404` whether the conversation doesn't
exist *or* belongs to another user — never `403`. This intentionally
overrides the original `FORBIDDEN | 403` error table entry for this
specific endpoint: returning `403` would confirm to an attacker that a
given UUID *exists*, just isn't theirs (resource-enumeration leak). This
is the same pattern GitHub and Stripe use. `403` remains reserved for
cases where confirming existence isn't a security concern.

**📌 Decision — response schema includes `updated_at`, `model`, `is_starred`.**
Not just `id`/`title`/`created_at`. These are already columns in the live
schema and the sidebar (Stage 5.4) will need them — adding now avoids a
breaking response-shape change later.

**📌 Decision — list ordering is `updated_at DESC`, not `created_at DESC`.**
"Most recent" in a chat app means most recently *active*, matching the
documented query pattern in §3.4. Becomes externally visible the moment
Stage 4.2 starts updating `updated_at` on new messages.

### 4.5 Standard Response Envelope

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "AUTH_INVALID", "message": "Token expired." } }
```

### 4.6 Error Codes Reference

| Error Code | HTTP Status | When It Occurs |
|---|---|---|
| AUTH_INVALID | 401 | Missing or malformed JWT |
| AUTH_EXPIRED | 401 | JWT expired |
| RESOURCE_NOT_FOUND | 404 | Resource doesn't exist **or isn't owned by caller** |
| VALIDATION_ERROR | 422 | Pydantic schema validation failed |
| AI_PROVIDER_ERROR | 502 | Upstream AI API error (including quota/billing) |
| INTERNAL_SERVER_ERROR | 500 | Unexpected backend error |

---

## 5. Design System

*(Unchanged from v1.0 — not yet implemented in code. Becomes active in
Stage 5.1. See original color tokens, glassmorphism variants, typography
scale, and screen component trees — all still valid and unbuilt.)*

Gold `#D97706` remains the single brand accent. Four glassmorphism
variants (Heavy/Medium/Light/Dark) remain as specified. Component trees
for Welcome, Home, and Chat screens remain as originally designed and are
the basis for Stage 5.1's approved component tree.

---

## 6. Execution Tracking

**This section is intentionally minimal.** Stage sequencing, gate
conditions, and completion status are tracked exclusively in
**`PYROBOT_EXECUTION_ROADMAP.md`** to avoid the two documents drifting
out of sync with each other — which is exactly what happened with v1.0
and is the reason this revision exists.

When in doubt about "what's next" or "is X done," the Roadmap is
authoritative. When in doubt about "how should X work" or "why was X
built this way," this document is authoritative.