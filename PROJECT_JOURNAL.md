# PROJECT_JOURNAL.md

## Pyrobot — Living Development Log

> Updated after every stage. Permanent record of every architectural decision, bug fix, and lesson learned.

---

## Entry #001 — Stage 1: Architecture Blueprint

**Date:** June 2026
**Stage:** 1 — Pre-build Architecture & Design System
**Status:** ✅ Complete

### The Challenge (1)

Pyrobot's PRD spans 5 major versions with 20+ features. The risk of starting to code without a clear foundation is real: scope creep, architectural debt, a product that never ships.

### Decisions Made

### Framework: Next.js (App Router) over plain React**

- File-based routing, server components, native streaming via ReadableStream, future SEO-ready.
- Trade-off: More complex mental model. Mitigated by strict folder structure.

### Backend: FastAPI over Flask**

- Async-first is non-negotiable for AI streaming. Pydantic validation at the API boundary. Auto-generated OpenAPI docs.
- Trade-off: Requires understanding async/await. Industry standard for AI backends — worth it.

### AI Abstraction: Provider Pattern (Strategy Pattern)**

- Single interface (`generate`, `stream`) with multiple implementations. To add a new model: one file + one factory line. Zero UI changes.
- This is the most important architectural decision in the project.

### Database: PostgreSQL with JSONB**

- Relational data for users/conversations, JSONB for flexible memory. Best of both worlds without NoSQL complexity.

### Auth: Argon2 over bcrypt**

- Argon2 is the current winner of the Password Hashing Competition. Memory-hard by design — more resistant to GPU cracking than bcrypt.

### State Management: Zustand over Redux**

- Lighter, simpler, no boilerplate. Perfect for chat application state.

### UI: shadcn/ui added to original stack**

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

### The Challenge(2)

Before any feature development, establish a foundation so clean that any developer can clone the repo, run one command, and have Pyrobot running locally. No AI features. No chat. Just a verified, runnable foundation.

### Decisions Made (1)

### **Monorepo structure (single repository)**

- `frontend/` and `backend/` co-located in one repo.
- Why: Easier to keep in sync, single PR for full-stack changes, simpler CI configuration.
- Alternative considered: Separate repos — rejected because cross-repo coordination adds friction at this stage.

### **Private repository at launch**

- API keys, early architecture decisions, and unfinished code should not be public.
- Can go public at any time. Starting public can't be undone.

**`requirements.txt` with pinned versions**

- `pip freeze > requirements.txt` after initial install locks exact versions.
- Why: Reproducibility. The app that works today should work in 6 months on a fresh machine.

**`psycopg[binary]` (psycopg3) over psycopg2**

- psycopg3 has native async support — required for SQLAlchemy 2.x async engine.
- psycopg2 is sync-only, requires workarounds for async. Not worth the compromise.

### **Lazy client initialization in AI providers**

- OpenAI client created on first use, not at import time.
- Why: The app should start without an API key configured. Fails loudly only when AI is actually called.

**`pydantic-settings` for configuration**

- Environment variables validated as typed Python objects via `Settings(BaseSettings)`.
- Invalid config (missing `DATABASE_URL`) raises a clear error at startup, not a cryptic runtime crash.

**`.env.example` committed, `.env` gitignored**

- `.env.example` shows every required variable with placeholder values.
- New developers know exactly what to fill in without asking.

### Repository Structure Created

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

### Lessons Learned (002)

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

## Sprint 0 - Backend Bootstrap

### Challenge

Create the first executable backend service while keeping future architecture extensible.

### Decision

Implement a minimal FastAPI application with:

- application entry point
- health endpoint
- centralized configuration module

Database and business logic intentionally deferred.

### Outcome

Verified application startup and established foundation for API development.

## Sprint 0 - API Foundation

### Challenge (0)

Introduce API versioning before additional endpoints are implemented.

### Decision (0)

Created a versioned API structure:

api/v1/

Future modules include:

- auth
- chat
- memory
- files

Introduced repositories layer to separate persistence concerns from business logic.

### Outcome (0)

Backend now supports versioned endpoints and follows:

Route → Service → Repository → Database

architecture.

Bug #001 — Next.js SWC Binary 404 on Windows

Stage: Pre-Stage 2 / Frontend Scaffolding
Symptom: Failed to download swc package — status 404 during create-next-app
Root Cause: npx create-next-app@latest resolved to a canary preview version (16.3.0-preview.0) that had no published Windows x64 SWC binary on the npm registry.
Fix: Deleted broken folder. Recreated with create-next-app@14.2.29 — the stable LTS version with full Windows SWC support.
Lesson: Always pin create-next-app to a stable version tag in the project setup instructions. Never use @latest on a new project — it can resolve to pre-release builds.

✅ Validation Checklist — Before We Proceed
Confirm each item before replying:

 frontend folder deleted and recreated cleanly
 npm run dev starts without errors
 <http://localhost:3000> shows the Next.js default welcome page
 Node version is 18+ (node --version in terminal)
 No SWC download errors in the terminal output

---
---

## Entry #004 — Sprint 0 Addendum: npm Audit & Allow-Scripts Resolution

**Date:** June 2026
**Stage:** Sprint 0 — Frontend Tooling Cleanup
**Status:** ✅ Complete

### The Challenge

After scaffolding completed on Next.js 16.2, `npm audit` reported 2 moderate vulnerabilities (later corrected from an initial misread of "5 vulnerabilities, 1 moderate/4 high" — re-run showed 2 moderate), both stemming from `next`'s internal bundled `postcss` dependency (XSS via unescaped `</style>` in stringify output). Additionally, `sharp` and `unrs-resolver` had pending install scripts blocked by `npm`'s `allowScripts` policy.

### Decisions Made (004)

**Do not run `npm audit fix --force`**

- The suggested force-fix would downgrade `next` from `16.2.x` to `9.3.3` — a ~7 major version regression that would break the entire frontend (App Router, Server Components, Turbopack, everything).
- The vulnerability lives in `next`'s own vendored `postcss` copy, not our direct dependency tree. This is Next.js's responsibility to patch in a future release.
- **Accepted as a known, low-severity, upstream-pending issue.** Re-check on next `npm update` / Next.js patch release.

### **Correct allow-scripts syntax**

- `npm approve-scripts <pkg-name>` is not a valid command (caused "Nothing to approve" silently).
- Correct command: `npm approve-scripts --allow-scripts-pending`, which interactively reviews all pending install scripts (`sharp@0.34.5`, `unrs-resolver@1.12.2`) for approval.
- Both packages are legitimate (native binary builds for image optimization and module resolution) — approved.

### Lessons Learned (004)

- `npm audit fix --force` should **never** be run reflexively — always inspect what it proposes to change first (`npm audit` shows the target version before forcing).
- Vulnerabilities in a framework's *own* bundled dependencies are best tracked and waited on, not force-patched by the consumer.
- `npm approve-scripts` requires the `--allow-scripts-pending` flag for interactive review; passing a package name directly does not work as one might assume.

### Stage Outcome (4)

- ✅ npm audit vulnerabilities reviewed and consciously deferred (upstream Next.js issue)
- ✅ `sharp` and `unrs-resolver` install scripts approved via correct command
- ✅ Frontend dependency tree confirmed stable on Next.js 16.2.x — no downgrade

### Deferred Items

- **Mobile device testing via `allowedDevOrigins`**: dev server warns about cross-origin HMR when accessed from phone on local network (e.g., `172.27.49.135`). Revisit when building actual UI screens (Stage 4+), especially Stage 8 (Polish/mobile layout verification). Not needed while only the default boilerplate page exists.

### Next Stage

**Stage 2 — Backend Foundation** (per Entry #003): FastAPI scaffolding, PostgreSQL connection, Alembic migrations, JWT auth with Argon2.

### **Gate condition:** Register a user, log in, call `/auth/me` with token successfully via Postman/curl

---

---

## Entry #005 — Stage 2: Backend Foundation (In Progress)

**Date:** June 2026
**Stage:** 2 — Backend Foundation
**Status:** ⏳ In Progress

### The Challenge (5)

Stage 1 (architecture + frontend scaffolding) is complete and verified. Stage 2 requires a running database before any models, migrations, or auth endpoints can be built.

### Decisions Made (5)

### **PostgreSQL via Docker Compose (not native install)**

- Docker Desktop installed (v29.5.3) — required enabling WSL2 first via `wsl --install` (elevated Command Prompt), since it wasn't previously installed on this machine.
- `docker-compose.yml` created at project root defining a `postgres:17` service with:
  - Named volume `pyrobot_pg_data` for data persistence across container restarts/recreations
  - Port `5432:5432` mapped to host, so the natively-running FastAPI app can connect via `localhost`
  - Healthcheck via `pg_isready`
  - Credentials sourced from `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) with sane dev defaults

**`DATABASE_URL` driver: `postgresql+psycopg://`**

- The `+psycopg` suffix tells SQLAlchemy 2.x to use psycopg3 (per Sprint 0 decision), not psycopg2.

### Bugs Encountered

**`WSL2 not installed / Docker Desktop daemon connection failure`**

- Initial `docker ps` failed: `npipe:////./pipe/docker_engine` not found — Docker Desktop's auto WSL install attempt failed due to missing elevation.
- Fix: ran `wsl --install` from an **elevated** Command Prompt, restarted, then launched Docker Desktop manually from Start menu. After Docker Desktop fully started (green "Engine running"), `docker ps` succeeded.
- Lesson: Docker Desktop on Windows silently depends on WSL2 being present *and* properly initialized — its own bundled installer can fail without admin rights, requiring a manual elevated `wsl --install`.

### Stage Outcome (so far)

- ✅ Docker Desktop + WSL2 installed and verified (`docker --version`, `docker ps`)
- ✅ `docker-compose.yml` created (PostgreSQL 17, named volume, healthcheck)
- ✅ Container `pyrobot-postgres` running and healthy on port 5432
- ⏳ `.env` updated with `POSTGRES_*` and `DATABASE_URL` — pending confirmation
- ⏳ Remaining Stage 2 steps: SQLAlchemy session setup, User model, Alembic migration 001, Argon2 + JWT security module, auth schemas, repository/service/router layers, gate test

### Next Step

Verify `pydantic-settings` correctly loads `DATABASE_URL` from `.env`, then build `core/database.py` (SQLAlchemy 2.x async engine + session factory).

## Entry #006 — Stage 2.1: SQLAlchemy Domain Models

### Challenge (6)

Implement the foundational database schema for
authentication, conversations, messages, and memory.

### Decision (6)

Created four core SQLAlchemy entities:

- User
- Conversation
- Message
- Memory

Adopted UUID primary keys and a shared TimestampMixin.

Maintained a single DeclarativeBase in core/database.py.

### Outcome (6)

The application successfully starts and all health
checks pass with the new model layer integrated.

---
---

## Entry #007 — Stage 2.2: Alembic Wiring, First Migration, and Bug Fixes

**Date:** June 2026
**Stage:** 2 — Backend Foundation
**Status:** ✅ Complete — unblocks remaining Stage 2 work

### The Challenge (7)

`alembic init alembic` had been run locally but never committed or wired up — `env.py` still had `target_metadata = None` and `alembic.ini` still held its placeholder URL, so no real migration could be generated. Generating one also exposed a latent bug in the `Message` model that had nothing to do with Alembic itself.

### Decisions Made (7)

**Override `sqlalchemy.url` from `env.py`, not `alembic.ini`**
- `alembic.ini` is tracked by git — real database credentials should never live in a tracked file.
- `env.py` now imports `app.core.config.settings` and calls `config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)`. The same gitignored `.env` the FastAPI app already reads is now the single source of truth for both the app and migrations.

**Import all models in `env.py` before setting `target_metadata`**
- Alembic's autogenerate only "sees" tables registered on `Base.metadata` *at the moment `env.py` runs*. Importing `app.models` (User, Conversation, Message, Memory) is what populates that registry.

### Bugs Encountered (7)

**`Message.metadata` collided with SQLAlchemy's reserved `Base.metadata`**
- The instant `env.py` tried to import the models, it raised `InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API`.
- Every class inheriting `Base` already owns a `.metadata` attribute (the `MetaData` registry itself) — naming a column the same thing collides with it.
- Fix: renamed the column attribute to `extra_data` in `backend/app/models/message.py`.
- This bug existed silently since the model was first written. It never surfaced because nothing imported `app.models` until Alembic needed to.

**`requirements.txt` saved as UTF-16, not UTF-8**
- Root cause: `pip freeze > requirements.txt` run from PowerShell, where `>` redirection defaults to UTF-16LE. Confirmed via `file backend/requirements.txt` reporting "Unicode text, UTF-16."
- Would have broken `pip install -r requirements.txt` on any Linux target (Railway, CI, Docker) — pip's parser expects UTF-8/ASCII.
- Fix: re-saved as UTF-8, no BOM. Also removed a stray, unused `asyncpg==0.31.0` pin left over from earlier driver troubleshooting — the project uses `psycopg[binary]` exclusively.

### Lessons Learned (7)

- A model can be syntactically valid Python and still crash on import — the failure mode only appears once *something* actually imports it. Don't assume "the app starts fine" means every model file is safe.
- Never trust a config file's encoding by how it looks in an editor — `file <filename>` from a real shell is the ground truth.
- Migrations should be generated against a real running database and inspected before being trusted, not authored by hand.

### Stage Outcome (7)

- ✅ `env.py` wired: `target_metadata = Base.metadata`, real `DATABASE_URL` injected at runtime
- ✅ `Message.extra_data` renamed — models import cleanly
- ✅ Migration `92aa08f433c4_initial_schema.py` generated via `alembic revision --autogenerate`
- ✅ Migration applied via `alembic upgrade head` — verified all 5 tables exist (`users`, `conversations`, `memories`, `messages`, `alembic_version`)
- ✅ `requirements.txt` re-encoded to UTF-8, unused `asyncpg` dependency removed

### Next Stage

**Stage 2.3 — Auth Module**: `core/security.py` (Argon2 hashing + JWT creation/verification), Pydantic auth schemas, `api/v1/auth.py` implementing `/auth/register`, `/auth/login`, `/auth/me`.

**Gate condition (unchanged):** Register a user, log in, call `/auth/me` with the returned token successfully.

---
---

## Entry #008 — Stage 2.2 Verified for Real: Port Collision Root Cause

**Date:** June 2026
**Stage:** 2 — Backend Foundation
**Status:** ✅ Complete and verified on the actual development machine

### The Challenge (8)

Entry #007's migration was generated and verified, but only against a temporary test database — not the project's real Docker Postgres on Windows. Running `alembic upgrade head` for real failed with `password authentication failed for user "pyrobot"` — the same symptom mentioned, and never fully explained, back in Entry #005.

### Root Cause — Correcting the Record

The earlier working theory was a client-side SCRAM negotiation issue in `psycopg[binary]` on Windows. That theory was wrong, and it's worth correcting explicitly rather than leaving it standing uncorrected: there were **two separate PostgreSQL servers both bound to port 5432** on the same machine — Docker's container (the intended one) and a native PostgreSQL 17 Windows installation (Windows service `postgresql-x64-17`), left over from before this project, running independently in the background. Depending on which one a given connection reached, Python could be rejected by a real server that had simply never heard of the `pyrobot` role — producing a textbook "wrong password" error despite the `.env` credentials being correct the entire time.

This also retroactively explains the original mystery from Entry #005: `psql` succeeding while Python failed were likely never hitting the same server in the first place.

### How We Found It

- `netstat -ano | findstr :5432` showed two distinct PIDs listening on the same port, not one.
- Docker's own container log (`docker logs pyrobot-postgres`) showed **no failed-login entry at all** for the rejected attempts — proof those attempts never reached the container, ruling out a real credential or driver problem on Docker's side.
- `Get-CimInstance Win32_Process` revealed the second PID's real executable: `C:\Program Files\PostgreSQL\17\bin\postgres.exe`. A non-elevated PowerShell session returned blank fields for this and was a dead-end red herring; re-running from an **elevated** session revealed the real path.
- `Get-Service` (filtered by name, not by PID — the PID-based filter was unreliable) confirmed the registered Windows service `postgresql-x64-17` behind it.

### Decision Made (8)

**Disable, don't uninstall, the native service.**
`Set-Service -Name "postgresql-x64-17" -StartupType Disabled` stops it from auto-starting on every future boot, while leaving the install itself intact in case it's ever needed for something unrelated to this project. Fully reversible.

### Lessons Learned (8)

- An error message naming the exact thing you expect ("password authentication failed for user `pyrobot`") doesn't guarantee the failure is actually about that — it only proves *some* server rejected those credentials, not which server.
- When a client-side error and a server-side log disagree about what happened, trust the server log. `docker logs` showing nothing was the single strongest clue in this entire investigation.
- `Get-CimInstance`/WMI queries can silently return blank fields when run without Administrator rights — indistinguishable from "this information doesn't exist" unless you know to re-run elevated.
- Wiping the Docker volume and recreating the container (the first fix attempted) didn't fail randomly — it was never going to fix this, since the bug had nothing to do with Docker. Ruling out one cause with a clean test is still useful progress even when it isn't the real one.

### Stage Outcome (8)

- ✅ Native `postgresql-x64-17` service disabled
- ✅ Port 5432 confirmed single-owner (Docker only) via `netstat`
- ✅ `alembic upgrade head` succeeded against the real project database
- ✅ All 5 tables verified via `psql \dt`: `users`, `conversations`, `messages`, `memories`, `alembic_version`
- ✅ Stage 2.2 (Alembic + migrations) is now genuinely, fully complete

**Addendum:** removed a leftover debug `print(settings.DATABASE_URL)` block from `env.py` (added during the live troubleshooting above) plus a redundant duplicate `config.set_main_option(...)` call left behind alongside it. Worth removing on principle, not just tidiness — printing a full `DATABASE_URL` (including the password) to stdout on every Alembic invocation is fine for an interactive terminal but becomes a real exposure the moment migrations ever run inside a CI log. Re-verified `alembic upgrade head` still runs cleanly with no behavior change after the removal.
 
### Next Stage
 
**Stage 2.3 — Auth Module**: `core/security.py` (Argon2 hashing + JWT creation/verification), Pydantic auth schemas, `api/v1/auth.py` implementing `/auth/register`, `/auth/login`, `/auth/me`.
 
**Gate condition (unchanged):** Register a user, log in, call `/auth/me` with the returned token successfully.