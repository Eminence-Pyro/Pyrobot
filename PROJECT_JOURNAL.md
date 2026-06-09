# PROJECT_JOURNAL.md
## Pyrobot — Living Development Log

> Updated after every stage. Permanent record of every architectural decision, bug fix, and lesson learned.

---

## Entry #001 — Stage 1: Architecture Blueprint
**Date:** June 2026
**Stage:** 1 — Pre-build Architecture & Design System
**Status:** ✅ Complete

### The Challenge
Pyrobot's PRD spans 5 major versions with 20+ features. The risk of starting to code without a clear foundation is real: scope creep, architectural debt, a product that never ships.

### Decisions Made

**Framework: Next.js (App Router) over plain React**
- File-based routing, server components, native streaming via ReadableStream, future SEO-ready.
- Trade-off: More complex mental model. Mitigated by strict folder structure.

**Backend: FastAPI over Flask**
- Async-first is non-negotiable for AI streaming. Pydantic validation at the API boundary. Auto-generated OpenAPI docs.
- Trade-off: Requires understanding async/await. Industry standard for AI backends — worth it.

**AI Abstraction: Provider Pattern (Strategy Pattern)**
- Single interface (`generate`, `stream`) with multiple implementations. To add a new model: one file + one factory line. Zero UI changes.
- This is the most important architectural decision in the project.

**Database: PostgreSQL with JSONB**
- Relational data for users/conversations, JSONB for flexible memory. Best of both worlds without NoSQL complexity.

**Auth: Argon2 over bcrypt**
- Argon2 is the current winner of the Password Hashing Competition. Memory-hard by design — more resistant to GPU cracking than bcrypt.

**State Management: Zustand over Redux**
- Lighter, simpler, no boilerplate. Perfect for chat application state.

**UI: shadcn/ui added to original stack**
- Pre-built accessible components we can style to match the Pyrobot design system. Eliminates building buttons, dialogs, and inputs from scratch.

### Document Consolidation
- Before: 6 separate files (PRD, Blueprint, Export, SSP, API Contract, DB Design)
- After: 1 master document (Pyrobot_Master_Document.docx) + this living journal
- Reason: Single source of truth is faster to reference and maintain.

### Lessons Learned
- Define design tokens before writing any component.
- Approve component trees before implementation code.
- Folder structure is architecture. Get it right in Stage 1.

### Stage 1 Outcome
- ✅ Master project document (6 sections, all specs consolidated)
- ✅ Component trees for all 5 V1 screens
- ✅ Design token system (colors, glassmorphism, typography, animation)
- ✅ Full folder structure (frontend + backend)
- ✅ Complete SQL schema
- ✅ Full API contract
- ✅ AI Provider Pattern designed (TypeScript + Python)

---
---

## Entry #002 — Sprint 0: Project Foundation
**Date:** June 2026
**Stage:** Sprint 0 — Repository, Tooling, Environment
**Status:** ✅ Complete

### The Challenge
Before any feature development, establish a foundation so clean that any developer can clone the repo, run one command, and have Pyrobot running locally. No AI features. No chat. Just a verified, runnable foundation.

### Decisions Made

**Monorepo structure (single repository)**
- `frontend/` and `backend/` co-located in one repo.
- Why: Easier to keep in sync, single PR for full-stack changes, simpler CI configuration.
- Alternative considered: Separate repos — rejected because cross-repo coordination adds friction at this stage.

**Private repository at launch**
- API keys, early architecture decisions, and unfinished code should not be public.
- Can go public at any time. Starting public can't be undone.

**`requirements.txt` with pinned versions**
- `pip freeze > requirements.txt` after initial install locks exact versions.
- Why: Reproducibility. The app that works today should work in 6 months on a fresh machine.

**`psycopg[binary]` (psycopg3) over psycopg2**
- psycopg3 has native async support — required for SQLAlchemy 2.x async engine.
- psycopg2 is sync-only, requires workarounds for async. Not worth the compromise.

**Lazy client initialization in AI providers**
- OpenAI client created on first use, not at import time.
- Why: The app should start without an API key configured. Fails loudly only when AI is actually called.

**`pydantic-settings` for configuration**
- Environment variables validated as typed Python objects via `Settings(BaseSettings)`.
- Invalid config (missing `DATABASE_URL`) raises a clear error at startup, not a cryptic runtime crash.

**`.env.example` committed, `.env` gitignored**
- `.env.example` shows every required variable with placeholder values.
- New developers know exactly what to fill in without asking.

### Repository Structure Created
```
pyrobot/
├── frontend/                    ← Next.js (initialized in Stage 0.3)
├── backend/
│   ├── app/
│   │   ├── api/                 ← Routers (Stage 2+)
│   │   ├── core/
│   │   │   ├── config.py        ← Settings from .env
│   │   │   └── database.py      ← SQLAlchemy async session
│   │   ├── models/              ← SQLAlchemy models (Stage 2)
│   │   ├── schemas/             ← Pydantic schemas (Stage 2)
│   │   ├── services/
│   │   │   └── ai/
│   │   │       ├── base.py      ← AIProvider interface
│   │   │       ├── factory.py   ← get_provider(model_name)
│   │   │       └── openai_provider.py  ← Stage 3
│   │   └── main.py              ← FastAPI entry point
│   ├── tests/
│   │   └── test_health.py       ← Smoke tests
│   └── requirements.txt
├── docs/
├── scripts/
├── docker/
├── PROJECT_JOURNAL.md
├── README.md
├── .gitignore
└── .env.example
```

### Lessons Learned
- Get the `.gitignore` right before the first commit. Accidentally committing `node_modules/` or `.env` to git history is painful to undo.
- `pydantic-settings` is the correct pattern for FastAPI config — not `os.getenv()` scattered everywhere.
- Write smoke tests before any features. A health check test that passes proves the framework wired up correctly.

### Stage Outcome
- ✅ Full monorepo structure created
- ✅ Backend entry point (FastAPI + CORS + health endpoints)
- ✅ Config system (`pydantic-settings`)
- ✅ Database session factory (SQLAlchemy 2.x async)
- ✅ AI abstraction layer scaffold (base, factory, OpenAI stub)
- ✅ Smoke tests for health endpoints
- ✅ `.gitignore`, `.env.example`, `requirements.txt`
- ✅ `README.md` with full setup instructions
- ✅ Frontend scaffold directory (Next.js initialized manually per Stage 0.3)

### Verification Gate
Before Stage 1 (Backend Foundation), confirm:
- [ ] `uvicorn app.main:app --reload` starts without errors
- [ ] `GET /` returns `{"status": "ok"}`
- [ ] `GET /docs` shows Swagger UI
- [ ] `pytest tests/test_health.py` passes
- [ ] `npm run dev` starts Next.js on localhost:3000

---
---

## Entry #003 — [Pending]
**Date:** TBD
**Stage:** 1 — Backend Foundation
**Status:** ⏳ Awaiting Sprint 0 gate verification

> To be filled in after Stage 1 is complete.

---

*Entry format:*
```markdown
## Entry #NNN — Stage N: [Name]
**Date:**
**Stage:**
**Status:** ⏳ In Progress / ✅ Complete / ❌ Blocked

### The Challenge
### Decisions Made
### Bugs Encountered (if any)
### Lessons Learned
### Stage Outcome
### Next Stage
```
