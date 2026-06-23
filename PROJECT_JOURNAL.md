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

---

## Entry #009 — Stage 2.3: Auth Module

**Date:** June 2026
**Stage:** 2.3 — Auth Module
**Status:** ✅ Complete

### The Challenge (2.3)

Stage 2.2 left us with a working database and a `User` model, but no way to actually create an account, prove identity on a later request, or protect a route. The goal was registration, login, and a protected `/me` endpoint — without scattering database queries and security logic across every route handler, since chat and memory will both need this same "who is making this request" check very soon.

### Decisions Made (9)

1. **Repository → Service → Router layering**, used for real for the first time in this project. `UserRepository` only runs queries; `AuthService` holds the business rules (duplicate checks, password verification, token issuance) and expresses failures as domain exceptions (`EmailAlreadyRegisteredError`, `InvalidCredentialsError`) rather than HTTP codes; `api/v1/auth.py` is a thin translator from those exceptions into the right response. A future "delete my account" feature can call `AuthService` directly instead of re-implementing duplicate-check logic inside another route.

2. **Argon2 over bcrypt** for password hashing, via `passlib` + `argon2-cffi` — Argon2 is the Password Hashing Competition winner and is memory-hard, resisting GPU/ASIC cracking attempts far better than bcrypt.
3. **Access token only for V1**, via `python-jose`. Refresh-token rotation is already scaffolded in `config.py` (`JWT_REFRESH_TOKEN_EXPIRE_DAYS`) but deliberately deferred — the Stage 2 gate only requires register → login → `/me`, and refresh-token revocation done properly is its own scoped piece of work.
4. **Login by email**, matching the original API contract in the Master Document. `username` stays unique and reserved for a future public-facing display use, not authentication.
5. **`HTTPBearer` over `OAuth2PasswordBearer` for `get_current_user`**, corrected mid-stage after manual Swagger testing. `OAuth2PasswordBearer` is the right tool for an actual OAuth2 password-grant flow (form-encoded `username`/`password`/`client_id`) — ours is a plain JSON login, so it was the wrong scheme even though it's the one most tutorials default to. `HTTPBearer` just means "read the Authorization header," which is what we're actually doing.

### Bugs Encountered (9)

- **Pre-existing, unrelated**: `tests/test_health.py` called `/health` directly, but `health.router` is mounted under the `/api/v1` prefix in `main.py` — the real path was `/api/v1/health`. The route was always correct; only the test's path was wrong. Fixed as a one-line test correction.
- **Local merge artifact, not a code bug**: after pulling in the new files, `auth.py` ended up nested one level too deep at `api/v1/auth/auth.py` instead of `api/v1/auth.py`. Pylance's `"auth" is unknown import symbol` was the literal, accurate signal that the file wasn't where `main.py` expected — moving it up one level and deleting the empty folder resolved it immediately.
- **Swagger "Authorize" showed a username/password form, not a token field**: caused by `OAuth2PasswordBearer`, which renders Swagger's OAuth2 password-grant UI regardless of what the actual login endpoint accepts. Caught during the manual Stage 2.3 verification pass — swapped to `HTTPBearer(auto_error=False)`, which also required explicitly re-raising `401` ourselves, since `HTTPBearer`'s default behavior on a missing token is `403`, not the `401` our API contract documents.

### Lessons Learned (9)

- An IDE static-analysis error like `"X" is unknown import symbol` is often the most direct signal you'll get that a file genuinely isn't where the code expects — worth checking the literal file path before assuming it's a stale-cache false positive.
- Splitting "what the database knows" (repository) from "what's allowed to happen" (service) from "what HTTP status that becomes" (router) means each layer is testable independently — the test suite never had to know Argon2 was the specific hashing algorithm underneath.
- FastAPI's security classes aren't interchangeable just because they all produce "a token in the Authorization header" — `OAuth2PasswordBearer` carries real OAuth2 password-grant semantics (a specific form shape, a specific default error code) that only matter if your login endpoint actually speaks that protocol. Picking the class that matches your actual flow, rather than the one every tutorial happens to use, avoided building something that merely looked right in code but broke the moment it was clicked through in Swagger.

### Stage Outcome (9)

- ✅ `core/security.py` — Argon2 hashing + JWT create/decode
- ✅ `repositories/user_repository.py` + `services/auth_service.py` — Repository → Service pattern, used for the first time
- ✅ `schemas/auth.py` — `UserCreate`, `UserLogin`, `UserResponse`, `Token`
- ✅ `api/deps.py` — `get_current_user`, reusable by every future protected route
- ✅ `api/v1/auth.py` — `POST /register` (201), `POST /login` (200), `GET /me` (200), wired into `main.py`
- ✅ `tests/test_auth.py` — 4 passing tests: full flow, duplicate email (409), wrong password (401), missing token (401)
- ✅ Gate condition met: registered a user, logged in, called `/auth/me` with the returned token — verified via automated tests and a manual Swagger UI walkthrough
- ✅ Pre-existing `test_health.py` path bug fixed as a byproduct

## Entry #010 — Stage 3: AI Integration

**Date:** June 2026
**Stage:** 3 — AI Integration
**Status:** ✅ Complete

### The Challenge (10)

The Provider Pattern interface (`AIProvider`, `base.py`, factory) was already designed in Stage 1 and scaffolded in Stage 2, but all three providers had `NotImplementedError` bodies. Stage 3's job was to fill them in, add the streaming chat endpoint, and prove a real AI responds through the full stack — JWT auth → router → service → provider → SSE stream back to the client.

### Decisions Made (10)

1. **Stateless chat for Stage 3.** The `/chat/stream` endpoint accepts the full conversation history in the request body and returns a response. No DB writes, no conversation IDs. Persistence is Stage 6 — deliberately deferred so Stage 3 stays focused on the one hard new problem: getting streaming working cleanly end-to-end.

2. **SSE over WebSockets for streaming.** Server-Sent Events are one-directional (server → client), which is exactly what streaming AI responses need. WebSockets are bidirectional and add handshake complexity. SSE over HTTP/1.1 is simpler, works through proxies, and is trivially supported by `fetch()` in the browser.

3. **`async with` for the OpenAI stream.** The `client.chat.completions.create(stream=True)` call returns an async context manager. Using `async with` instead of a bare `async for` ensures the underlying HTTP connection is properly closed if the client disconnects mid-stream — important for not leaking connections under load.

4. **Disconnect check in the SSE generator.** `await http_request.is_disconnected()` is checked between every token. If the user closes the browser tab, we stop calling the AI immediately — saves API credits and keeps server resources clean.

5. **`[DONE]` sentinel as the stream terminator.** The final SSE event is `data: [DONE]\n\n` — the same convention used by OpenAI's API. The frontend can listen for this rather than inferring end-of-stream from connection close, which is unreliable across proxies and load balancers.

6. **JSON-encoded token payloads in SSE.** Each `data:` line carries `json.dumps(token)` rather than the raw token string. Newlines, quotes, and unicode in a response would break the SSE framing otherwise — any character that looks like an SSE protocol character gets safely escaped.

7. **Mocked providers in tests.** Tests patch `get_provider` at the service layer rather than hitting real APIs. The router, schemas, SSE framing, auth protection, and system prompt injection are all exercised for real — only the external HTTP call is replaced. This keeps the suite fast, deterministic, and free of API key requirements in CI.

8. **Claude's separate `system` parameter.** Anthropic's API doesn't accept a `{"role": "system", ...}` entry in the messages array — it has a dedicated top-level `system` parameter. `ClaudeProvider._split_messages()` extracts any system-role message before building the request, so the `ChatService` can pass a uniform message list to every provider without knowing about this difference.

9. **Gemini's `"model"` role.** Google's SDK uses `"model"` where everyone else uses `"assistant"`. `GeminiProvider` translates at the boundary via `_ROLE_MAP`, so the rest of the codebase never has to know.

### Stage Outcome (10)

- ✅ `OpenAIProvider.generate()` and `.stream()` fully implemented
- ✅ `ClaudeProvider` — full implementation with system prompt extraction
- ✅ `GeminiProvider` — full implementation with role translation
- ✅ `factory.py` — all three providers unlocked and mapped
- ✅ `services/chat_service.py` — system prompt prepended, drives the provider
- ✅ `schemas/chat.py` — `ChatRequest`, `ChatResponse`, `MessageIn`
- ✅ `api/v1/chat.py` — `POST /chat/stream` (SSE) and `POST /chat/generate` (JSON), both JWT-protected
- ✅ `tests/test_chat.py` — 5 passing tests (auth guard, generate response, unknown model 400, SSE format, system prompt injection)
- ✅ Full suite: 11/11 passed

## Entry #011 — Stage 3 Addendum: Dev Provider Validation

**Date:** June 2026
**Stage:** 3 — AI Integration (addendum, post-completion)
**Status:** ✅ Complete

### The Challenge (11)

Stage 3 was marked complete in Entry #010 on the strength of mocked-provider
tests and the architecture being correct on paper — but no provider had
actually been exercised against a real upstream API. No OpenAI or Anthropic
billing was set up, so the AI chat pipeline was technically untested in a
live sense. Rather than carry that gap into Stage 4, we stopped to close it
properly, using free-tier providers as a substitute for paid credentials.

### Decisions Made (11)

1. **Migrate `GeminiProvider` off `google-generativeai`.** Investigation
   before writing any code revealed the package was deprecated August 31,
   2025, in favor of the unified `google-genai` SDK. Continuing to build on
   a sunset package would have created a problem for a future stage to
   discover the hard way. Rewrote the provider against `client.aio.models
   .generate_content` / `.generate_content_stream`.
2. **Dropped the simulated "chat session" pattern.** The old SDK used
   `start_chat(history=...)`, which doesn't fit Pyrobot's stateless,
   full-history-per-request design (Entry #010, Decision 1). The rewrite
   sends the complete message list as `contents` on every call — matching
   both Gemini's own current documented pattern and our own architecture.
   This also incidentally eliminated a latent bug (see below).
3. **Added `GroqProvider`** as a fourth, permanent provider — not just a
   test stand-in. Free tier, no billing required, OpenAI-compatible message
   shape, and genuinely useful long-term (Master Doc roadmap already listed
   multi-provider support as a goal). Used Groq's native `AsyncGroq` client
   rather than pointing the OpenAI SDK at a foreign `base_url`, to keep
   error handling and streaming behavior native instead of assumed.
4. **Updated all four providers to current-generation models** — every
   model string registered in `factory.py` was stale (`gpt-4o`,
   `claude-3-5-sonnet-20241022`, `gemini-1.5-flash`). Verified current model
   IDs live rather than from memory, since model names move faster than any
   static knowledge can track:
   - OpenAI: `gpt-5.5`, `gpt-5.4-mini`
   - Claude: `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`
   - Gemini: `gemini-2.5-flash`, `gemini-2.5-flash-lite`
   - Groq: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`
5. **`DEFAULT_AI_MODEL` stays `gpt-5.5` in code**; local dev override happens
   in the gitignored `.env`, not in the committed default. Keeps the repo's
   source of truth aligned with production intent while solving the
   no-credits problem at the environment level.
6. **Built `scripts/test_streaming.py`** as a permanent diagnostic tool —
   timestamps each SSE chunk's arrival rather than relying on eyeballing
   terminal scroll, which is unreliable once a provider streams fast enough
   (Groq) that delivery looks instantaneous to the human eye even when it
   isn't.

### Bugs Encountered (11)

**Latent unpacking risk in the old `GeminiProvider`:** `*prior, last =
history` would raise `ValueError` on an empty history list. Never
triggered in practice (no live test had been run against it), but would
have surfaced eventually. Resolved as a side effect of the stateless
rewrite rather than patched directly — the line doesn't exist anymore.

**`asyncpg` resurfaced in `requirements.txt`** despite being explicitly
removed in Entry #007. Almost certainly pulled back in transitively by one
of today's new packages. Manually uninstalled and removed again — worth
revisiting if it reappears a third time, as that would suggest a direct
(not transitive) dependency somewhere worth tracking down.

### Lessons Learned (11)

- **A billing/quota error from a real provider is a *positive* test
  signal**, not a failure — it proves the request reached the correct
  external API with the correct shape. Don't mistake "the provider rejected
  it" for "our code is broken."
- **SDK deprecations are silent until something actually imports the
  code path.** The Gemini provider passed every prior check (it imported
  cleanly, the architecture was sound, mocked tests passed) while quietly
  resting on a sunset package. The fix was to check before assuming, not
  after something broke.
- **"It looks instant" is not proof of correct streaming behavior.** A
  timestamped script is a five-minute investment that turns a subjective
  eyeball check into objective proof — worth keeping as a standing tool,
  not a one-off.
- **Free-tier providers are legitimate dev-testing infrastructure**, not
  just a stopgap — Groq in particular is now a permanent fourth option in
  the Provider Pattern, proving the abstraction's real value: a new
  provider took one file and one factory entry, exactly as designed in
  Section 2.5 of the Master Document.

### Stage Outcome (11)

- ✅ `gemini_provider.py` fully migrated to `google-genai`, latent bug
  removed as a side effect
- ✅ `groq_provider.py` created — fourth provider, free tier, fully working
- ✅ `factory.py` updated — all four providers on current-generation models
- ✅ `config.py` / `.env.example` — `GROQ_API_KEY` added, dev-override
  pattern documented
- ✅ `scripts/test_streaming.py` — permanent SSE verification tool
- ✅ Live validation: `gemini-2.5-flash` and `llama-3.3-70b-versatile`
  both return real responses via `/chat/generate` AND real incremental
  streaming via `/chat/stream` (verified with timestamped proof, 7 distinct
  chunks over 1.16s)
- ✅ `gpt-5.5`, `gpt-5.4-mini`, `claude-sonnet-4-6`,
  `claude-haiku-4-5-20251001` all correctly route through the factory and
  fail only at the provider's billing boundary — confirms the Strategy
  Pattern resolves all four providers correctly
- ✅ `gpt-4o` correctly returns `Unknown model` — factory failure path
  intact post-rewrite
- ✅ `asyncpg` removed (again)

## Entry #012 — Stage 4.1: Conversation Persistence

**Date:** June 2026
**Stage:** 4.1 — Conversation Persistence
**Status:** ✅ Complete

### The Challenge (12)

Work on conversation persistence had already begun independently before
its place in the roadmap was confirmed — surfacing a real conflict
between two planning documents (Master Document's original Stage 4
"Frontend Shell" vs. an external `PYROBOT_EXECUTION_ROADMAP.md` putting
persistence at Stage 4 instead). That had to be reconciled before the
already-written code could be trusted as "the right next thing," not just
"a thing that was built."

### Decisions Made (12)

1. **Roadmap reconciliation: persistence-before-frontend wins.** The
   external roadmap's Stage 4 gate conditions (`POST /conversations
   works`, `tests pass`) are backend-testable, unlike the original Master
   Document's Stage 6 gate (`chat history survives page refresh`), which
   genuinely requires a UI to exist first. Adopted the external roadmap's
   *content and sequencing*, kept the *existing journal's stage numbers*
   — no retroactive renumbering of completed work.
2. **`PYROBOT_EXECUTION_ROADMAP.md` and `PYROBOT_MASTER_DOCUMENT.md` v2.0
   established as the two canonical planning documents**, both converted
   to proper `.docx` with stage tracking living exclusively in the
   Roadmap — eliminates the two-document drift that caused this whole
   detour in the first place.
3. **`title` is required, not optional, on `ConversationCreate`** —
   reversed from an earlier draft decision once `models/conversation.py`
   was actually seen: the live ORM column is `nullable=False`. The
   original Master Document's SQL schema (which suggested nullable) was
   written in Stage 1 as up-front design and never reconciled against
   what Stage 2.1 actually migrated. Auto-generated titles from a first
   message remain the intended end state — revisit in Stage 4.2, once a
   first message actually exists to generate one from.
4. **`model` / `is_starred` dropped from `ConversationResponse`** — same
   root cause; these columns don't exist on the live model at all. Not
   adding a migration for them now; tracked as backlog, not built ahead
   of need.
5. **Ownership enforced at the SQL layer, not just the service layer** —
   `ConversationRepository.get()` now filters by `user_id` directly in
   the query (defense in depth), matching Master Doc §3.4's documented
   pattern. A non-owned conversation and a nonexistent one are now
   indistinguishable at every layer, by design (404-for-both).
6. **Tests follow `test_auth.py`'s established pattern exactly** — inline
   `AsyncClient(transport=ASGITransport(app=app), ...)` per test, no
   shared `client` fixture, since none exists anywhere in this project.

### Bugs Encountered (12)

**Pylance `EllipsisType` errors on all three router functions.** Caused
by `current_user: Annotated[User, Depends(...)] = None` (and later
`= ...`) — both were attempts to satisfy Python's "no required parameter
after a defaulted one" rule, applied to the wrong parameter. Root cause:
mixing `Annotated`-style dependencies (no literal default) with
old-style `session=Depends(get_db)` (a real default) in the same
signature. Fixed by moving `session` into the same `Annotated` style via
a shared `DbSession` type alias — neither parameter carries a literal
default anymore, so ordering stops mattering and nothing needs faking.

**Test suite assumed a `client` fixture that was never written.**
`fixture 'client' not found` on every test, at setup, before any test
logic ran. Root cause: assumed a shared fixture pattern without checking
`test_auth.py` first. Resolved by matching the real, working pattern
exactly instead of inventing a parallel convention.

**Test registration payload didn't match the real schema.** Sent
`{"name", "email", "password"}`; the actual required shape (confirmed via
`test_auth.py`'s fixture) is `{"email", "username", "password"}` — no
`name` field exists. Would have produced a `422` on every test even after
the fixture bug was fixed. Caught by reading the real file instead of
assuming the payload shape.

### Lessons Learned (12)

- **When a planning document and a live model disagree, the model is
  always right** — it's what Alembic actually migrated, regardless of
  what an earlier design doc said. This is the second time in this stage
  alone that "the docs say X" turned out to be stale against real code
  (Entry #011 had the same pattern with deprecated SDKs).
- **Test files need the same ground-truth discipline as production
  code.** A test fixture or payload shape that "should" be right is just
  as capable of being wrong as a hand-written endpoint — and a wrong test
  fails *before* it can tell you anything about the code it was meant to
  verify, wasting a full round trip.
- **An existing passing test file is the single best source of truth for
  "how does this project actually test things"** — better than a style
  guide, better than memory, better than assumption. `test_auth.py`
  resolved two separate bugs the instant it was actually read.

### Stage Outcome (12)

- ✅ `conversation_repository.py`, `conversation_service.py`,
  `api/v1/conversations.py`, `schemas/conversation.py` — all implemented,
  reviewed, and corrected against the real ORM model
- ✅ `test_conversations.py` — 7/7 passing
- ✅ Manual Stage Gate walkthrough completed via Swagger UI
  (`/docs`) — create, list (correct ordering), get-by-id, 404 on
  nonexistent, 404 on not-owned, 401 unauthenticated
- ✅ `PYROBOT_EXECUTION_ROADMAP.md` and `PYROBOT_MASTER_DOCUMENT.md` v2.0
  established as canonical, reconciled planning documents

## Entry #013 — Stage 4.2: Message Persistence

**Date:** June 2026
**Stage:** 4.2 — Message Persistence
**Status:** ✅ Complete

### The Challenge (13)

Unlike Stage 4.1's single-resource CRUD, sending a message is an
orchestration problem: save the user's message, call an external AI
provider (a step that can fail), save the reply, and update the parent
conversation's activity timestamp — four operations that need to succeed
or fail together as one unit, not independently.

### Decisions Made (13)

1. **Commit boundary moved to the service layer**, exactly as
   `user_repository.py`'s own comment anticipated back in Stage 2.3:
   *"if a future feature needs several writes to succeed or fail
   together, that's the signal to move the commit boundary up."*
   `MessageRepository` gained a method deliberately named `stage()`, not
   `create()` — different name on purpose, so it can never be confused
   with `ConversationRepository.create()`, which *does* commit. `stage()`
   only does `session.add()`. `MessageService.send_message()` owns the
   single commit point, after both messages exist and the conversation
   timestamp is updated.
2. **`conversation.updated_at` is touched explicitly**, not left to
   `TimestampMixin`'s `onupdate=func.now()` alone — that only fires when
   a column on the `Conversation` row itself changes during flush. Adding
   child `Message` rows never touches the parent row, so without an
   explicit `conversation.updated_at = datetime.now(timezone.utc)` line,
   Stage 4.1's "most recently active first" ordering would have silently
   stopped working the moment this stage shipped.
3. **Endpoints nested under the conversation**
   (`POST/GET .../conversations/{id}/messages`), accepting only the new
   message rather than full history — the conversation already identifies
   the thread. Stage 3's `/chat/stream` and `/chat/generate` are
   deliberately left untouched as separate, stateless, conversation-
   agnostic passthroughs.
4. **`POST .../messages` returns both the user and assistant message** in
   one response — confirms the full round trip without a second request.
5. **Non-streaming first, by design** — mirrors Stage 3's own precedent
   (Entry #010: built `/chat/generate` because it's easier to test against
   a complete string). Streaming + persistence together is a deliberate
   fast-follow, not bundled into this stage, so a bug in one isn't
   confused for a bug in the other.
6. **Stage 4.2 is intentionally single-turn.** `ChatService.generate()`
   already prepends the system prompt itself, so `MessageService` sends
   only the new user content — no prior messages in the thread are passed
   as context yet. This is the documented gate boundary between 4.2
   ("messages saved") and 4.3 ("AI receives reconstructed history"), not
   an oversight.
7. **Tests call the real Groq API rather than mocking the provider** —
   flagged as a deliberate deviation from Entry #010's documented
   mocked-provider convention for chat tests, since `test_chat.py` wasn't
   available to match against. Chosen because this stage's actual claim
   to prove — a real saved reply, not a stubbed string — benefits from a
   real round trip, at zero cost via Groq's free tier.

### Bugs Encountered (13)

**Pylance: `Message` not assignable to `MessageResponse`.** The router
was passing raw SQLAlchemy ORM objects directly into
`MessageExchangeResponse`'s fields. This actually works at runtime
(`MessageResponse.model_config = {"from_attributes": True}` lets Pydantic
coerce arbitrary objects), but Pylance can't see through that runtime
behavior — it only checks declared types, which were genuinely mismatched.
Fixed by converting explicitly with `MessageResponse.model_validate(...)`
in the router, rather than suppressing the warning. Unlike the
`config.py` `# type: ignore[call-arg]` case (truly unavoidable),
this had a clean, fully type-safe fix — so that's what shipped, not
another suppression comment.

**`main.py` imported `from backend.app.api.v1 import messages`** —
wrong path, broke test collection entirely (`ModuleNotFoundError: No
module named 'backend'`). Root cause: when running from inside
`backend/` (which the venv and every documented command does), Python's
import root *is* `backend/` itself — so the package is `app`, never
`backend.app`. Every other router import in the file correctly used
`app.api.v1`; this one line didn't match the established pattern.
Corrected to `from app.api.v1 import messages`.

### Lessons Learned (13)

- **Explicit conversion beats implicit framework magic the moment a
  static type checker can't see through the magic.** Pydantic's
  `from_attributes` coercion is genuinely useful, but relying on it
  silently costs real type-safety value at every call site — worth
  spending one extra line to make the conversion visible in the code
  itself.
- **Import paths are relative to where the process actually runs, not
  to the project's folder structure on disk.** `backend/` is a real
  directory, but it is never part of the Python module path once you're
  running from inside it — a subtle distinction that's easy to get wrong
  exactly once and then copy-paste forward.
- **A linter flagging intentional repetition isn't a bug to fix** —
  `markdownlint`'s MD024 complaining about every journal entry reusing
  `### Decisions Made` / `### Lessons Learned` is the same category of
  false positive already logged for `pydantic-settings` in this journal:
  a tool correctly following its own rule, on a case the rule wasn't
  meant to catch.

### Stage Outcome (13)

- ✅ `message_repository.py`, `message_service.py`, `api/v1/messages.py`,
  `schemas/message.py` — implemented, reviewed, corrected
- ✅ `test_messages.py` — 7/7 passing, including a real round trip through
  Groq (not mocked)
- ✅ Manual Stage Gate walkthrough completed via Swagger UI
- ✅ Conversation `updated_at` correctly bumps on new messages — verified
  by automated test, protecting Stage 4.1's list-ordering guarantee

## Entry #014 — Stage 4.3: Context Reconstruction

**Date:** June 2026
**Stage:** 4.3 — Context Reconstruction
**Status:** ✅ Complete

### The Challenge (14)

Stage 4.2 deliberately sent the AI provider only the newest message,
even though full conversation history was already being saved correctly.
The data existed; it just wasn't being read back. This stage's entire
job was closing that one gap — not building new infrastructure, wiring
two already-built pieces (`MessageRepository.list_for_conversation()`
and `ChatService.generate()`) together for the first time.

### Decisions Made (14)

1. **History is capped at the most recent 20 messages**, not sent
   unbounded — directly implementing Master Document §2.6 Layer 4's
   original spec ("Conversation History — **last N messages**"), which
   Stage 4.2 hadn't yet reached. Unbounded history would grow every
   provider's token cost and latency linearly with conversation age;
   smarter summarization of older context is real future work, not a V1
   requirement.
2. **History is loaded BEFORE the new user message is staged**, not
   after. `MessageRepository.stage()` only adds to the session, never
   flushes — loading history first removes any ambiguity about whether
   the brand-new message could leak into its own "prior" context via
   SQLAlchemy's autoflush timing. One explicit boundary, not an implicit
   one.
3. **No new endpoint, schema, or repository method.** `GET
   .../conversations/{id}/messages` (built in Stage 4.2) already
   satisfies "reload a conversation correctly" — this gate item was
   met a stage early as a side effect of 4.2's design, not separately
   planned. Only `message_service.py` was touched.
4. **Proof strategy: an unguessable nonce, not a vibe check.** The test
   plants a fabricated word in turn one and asks for it back in turn two.
   An LLM cannot produce that exact string from training data or chance —
   the only path to it appearing in the reply is genuine context-passing.
   Far stronger evidence than asserting the response merely "looks
   contextual."

### Bugs Encountered (14)

None. First stage in this project's history with zero corrections needed
between the conceptual brief and the passing test run — likely because
both pieces being wired together (`MessageRepository`,
`ChatService.generate()`) were already fully known, tested, and verified
in prior stages, with no new ground-truth files required.

### Lessons Learned (14)

- **An unguessable-nonce test is a meaningfully stronger proof than a
  plausibility check** for anything involving an LLM — "the AI
  remembered something specific it could not have known any other way"
  closes off the possibility of a test passing for the wrong reason
  (e.g., the model coincidentally producing contextually-appropriate
  text without actually receiving the prior turn).
- **Designing one stage's output to already satisfy a later stage's gate
  is a sign the architecture is composing correctly** — Stage 4.2's
  `GET` endpoint quietly finishing part of 4.3's job is a good outcome,
  not a coincidence to be suspicious of.

### Stage Outcome (14)

- ✅ `message_service.py` updated — history loaded and capped before
  each AI call
- ✅ `test_context_reconstruction.py` — 2/2 passing, including the
  nonce-word multi-turn proof
- ✅ `test_messages.py` re-run alongside — 7/7 still passing, confirming
  Stage 4.2 behavior is fully backward-compatible with the Stage 4.3
  change
- ✅ 9/9 total across both files

## Entry #015 — Stage 4.4: Memory System (Stage 4 Complete) (14)

**Date:** June 2026
**Stage:** 4.4 — Memory System
**Status:** ✅ Complete — closes Stage 4 in full

### The Challenge (15)

Wire persistent, per-user key-value memory into the AI pipeline, fulfilling
Master Document §2.6's Layers 2–3 ("User Profile" / "Relevant Memory
Snippets") for the first time — until now, every system prompt was a
static string regardless of who was asking.

### Decisions Made (15)

1. **`UNIQUE(user_id, key)` added via a real migration before any service
   code was written.** Investigating `models/memory.py` against the
   original docx's schema surfaced a genuine gap: the actual applied
   migration (`92aa08f433c4_initial_schema.py`) created `key` as a plain
   *non-unique* index — `unique=False`, explicitly. The original design's
   `UNIQUE(user_id, key)` constraint had been designed but never actually
   migrated. Fixed at the schema layer (migration
   `6351e1420b8a`), not papered over in application code, while the
   table was still empty — the cheapest possible moment to correct it.
2. **`MemoryRepository.upsert()` uses Postgres's native
   `INSERT ... ON CONFLICT DO UPDATE`**, not a check-then-write pattern —
   atomic by construction, immune to a race between two simultaneous
   writes to the same key. Commits directly in the repository (one
   standalone operation, no other repository call sharing its
   transaction), per the same rule `user_repository.py` established back
   in Stage 2.3.
3. **`extra_context` folds into the single existing system message**,
   never added as a second one. Re-reading `gemini_provider.py` before
   writing the integration surfaced that its `_build_contents()`
   overwrites `system_instruction` on the *last* system-role message it
   sees — a second system message would have silently discarded either
   Pyrobot's base personality or the injected memory, depending on
   message order, with no error raised anywhere. Caught proactively, not
   after a silent failure in production.
4. **`category` dropped from the API contract** — same missing-field
   story as `Conversation.model`/`is_starred` in Stage 4.1; the live
   model never had it.
5. **`value` is a JSON object (`dict`), not a plain string** — matches
   the real `JSONB` column type; the original docx's example payload
   (a bare string) would now mismatch the declared schema.
6. **`build_context_string()` returns `None` when a user has no stored
   memory**, rather than an empty string — callers skip injection
   entirely instead of sending a meaningless context block to the
   provider on every single request.

### Bugs Encountered (15)

**Missing unique constraint, confirmed via the real migration file** —
see Decision 1. Significant beyond a cosmetic gap: writing
`get_by_key()` with this project's normal `.scalar_one_or_none()`
pattern would have *crashed* (`MultipleResultsFound`) the instant two
rows existed for one key, rather than silently returning wrong data.

**`test_chat.py::test_generate_unknown_model_returns_400` failed during
this stage's full-suite regression pass** — but its root cause predates
Stage 4.4 entirely. The test used `llama-3.3-70b-versatile` as an
example of an *unregistered* model; that was true in Stage 3 (Entry
 #010) and became false the moment the Stage 3 Addendum (Entry #011)
registered Groq. Nothing in Stage 4 touched `factory.py` — this was a
stale test fixture, invisible to every per-stage test run since Stage 3,
only surfaced because this was the first time the *entire* suite ran
together. Fixed by replacing the fixture with a string no real provider
would ever register (`"definitely-not-a-real-model-xyz"`), making the
assumption structurally durable instead of currently-true-by-coincidence.

### Lessons Learned (15)

- **A full regression pass earns its cost the moment it catches something
  per-stage testing structurally cannot** — every individual stage's
  tests had passed in isolation the entire time; only running everything
  together exposed a real cross-stage collision between Entry #011 and
  Stage 4.4's test suite.
- **"This value doesn't exist" test fixtures need to be impossible to
  become true, not just currently true** — the same principle this
  project already applies to schemas (verify the live migration, not the
  design doc) applies equally to test data referencing things that can
  change out from under a test, like a provider's registered model list.
- **Re-reading a previously-correct file before extending it is cheap
  insurance.** `gemini_provider.py` was fully correct and fully tested in
  Stage 3 — but Stage 4.4 changed *how* it would be called (potentially
  multiple system messages), which only a re-read, not a memory of past
  correctness, could catch.

### Stage Outcome (15)

- ✅ Migration `6351e1420b8a` — `UNIQUE(user_id, key)` enforced at the DB
  layer
- ✅ `memory_repository.py`, `memory_service.py`, `api/v1/memory.py`,
  `schemas/memory.py` — implemented and tested
- ✅ `chat_service.py` extended with `extra_context` (backward-compatible;
  Stage 3's `/chat/generate` and `/chat/stream` unaffected)
- ✅ `message_service.py` now loads and injects memory into every AI call
- ✅ `test_memory.py` — 7/7 passing, including direct proof the unique
  constraint prevents duplication and that memory genuinely influences AI
  responses (unguessable-nonce strategy, same rigor as Stage 4.3)
- ✅ `test_chat.py` stale-fixture bug found and fixed during regression
- ✅ **Full suite: 34/34 passing, simultaneously, for the first time**

### Stage 4 — Closed (15)

All four substages (Conversation Persistence, Message Persistence,
Context Reconstruction, Memory System) complete and verified together,
not just individually. Pyrobot's backend now has a fully working,
multi-provider, persistent, context-aware, memory-influenced chat
pipeline — the entire foundation Stage 5's frontend will be built
against.

## Entry #016 — Stage 5.1: Frontend Shell
**Date:** June 2026
**Stage:** 5.1 — Frontend Shell
**Status:** ✅ Complete

### The Challenge
Build the entire frontend foundation — design tokens, theme system,
navigation shell, Zustand stores, TanStack Query provider, API service
layer, type definitions, and all screen shells — against a Next.js 16.2.6
scaffold using Tailwind v4, a technology combination where several
established conventions (tailwind.config.ts, class-based theming) no
longer apply.

### Decisions Made
1. **TanStack Query added to the official stack** alongside Zustand —
   Zustand owns client state (auth session, active conversation, streaming
   buffer, selected model); TanStack Query owns server state (conversation
   lists, message history, memory entries). Separation is cleaner than
   putting everything in Zustand stores, which is the junior pattern. Logged
   as an official stack update in the Master Document.
2. **Mobile-first layout: BottomNavBar + center FAB**, not a sidebar —
   matches Master Document §5.6's component trees and the app's
   mobile-first design philosophy. Sidebar was in an external brief we
   superseded.
3. **Tailwind v4 — no `tailwind.config.ts`**. Tailwind v4 eliminated
   the JavaScript config file entirely. All design tokens, custom utilities,
   and theme overrides live in `globals.css` under `@theme inline`,
   `@layer utilities`, and CSS custom properties in `:root`/`.dark`. The
   file doesn't exist to find because it was never generated.
4. **Design tokens added to `globals.css` without replacing shadcn's
   existing theme** — Pyrobot's gold/glassmorphism system added in clearly
   marked sections alongside shadcn's OKLCH semantic color tokens, not
   instead of them. shadcn components continue to work correctly.
5. **`next-themes` for theme switching** — `ThemeProvider` wraps the app,
   `attribute="class"` adds/removes the `.dark` class on `<html>`,
   CSS variables flip automatically. `suppressHydrationWarning` on `<html>`
   in `layout.tsx` handles the expected server/client mismatch on first
   render (next-themes reads localStorage client-side, which the server
   can't know about).
6. **Service layer created as typed placeholders now** — `api-client.ts`,
   `auth-service.ts`, `conversation-service.ts`, `memory-service.ts`,
   `chat-service.ts` all exist with correct types and real API shapes, but
   no component calls them yet. Architecture exists before it's needed,
   not discovered mid-feature.

### Bugs Encountered
**`useEffect(() => setMounted(true), [])` flagged by ESLint
`react-hooks/set-state-in-effect`** — React 19's stricter rule flags
calling setState synchronously inside an effect body. The mounted-guard
pattern was unnecessary: `next-themes` provides `resolvedTheme` which
returns `undefined` before hydration, giving the same "not-yet-resolved"
signal without needing extra state. Removed entirely; `resolvedTheme`
drives the icon selection directly.

**Windows NTFS case-insensitivity deleted `TopBar.tsx`** — running
`Remove-Item Topbar.tsx` on Windows deleted both the old `Topbar.tsx`
(lowercase b) and the new `TopBar.tsx` (capital B) simultaneously, since
NTFS treats them as the same path. On Linux/macOS/Railway (production),
these are genuinely distinct files. Manifested as a build error
(`Module not found: Can't resolve '@/components/layout/TopBar'`) after
the file appeared to have been created successfully. Fixed by recreating
the file and clearing Turbopack's cache (`Remove-Item -Recurse -Force
.next`). This is the same category of Windows-specific trap as Entry
#007's UTF-16 encoding issue and Entry #008's ProactorEventLoop — both
resolved, both worth remembering for future Windows-specific debugging.

**Turbopack cache held stale resolution** — even after the file was
recreated, the build still failed with the same module-not-found error
until `.next/` was deleted. Turbopack's incremental build cache can
persist incorrect module resolutions across builds. When a file is
deleted and recreated (especially with case changes on Windows), always
clear `.next/` before the next build.

### Lessons Learned
- **Tailwind v4 is a genuinely different mental model from v3** — no
  `tailwind.config.ts`, no `theme.extend`, no `darkMode: 'class'`. All
  configuration lives in CSS itself. The absence of a config file is
  correct, not a setup error. Read `globals.css` as the single source
  of truth for the token system.
- **On Windows, file case changes are invisible to the filesystem** —
  renaming `Topbar.tsx` to `TopBar.tsx` in Explorer or VS Code may appear
  to work while NTFS still treats both names as the same path. Git,
  Turbopack, and TypeScript on Linux will see them correctly; Windows
  tools won't. Always verify with `Get-Item` when case matters.
- **Clear `.next/` when module resolution behaves unexpectedly** —
  Turbopack's cache is the first thing to suspect when "the file exists
  but the build can't find it."

### Stage Outcome
- ✅ `globals.css` — full Pyrobot design token system (gold, glassmorphism
  variants, typography scale, animation tokens) alongside shadcn's
  existing OKLCH theme
- ✅ `layout.tsx` — root layout with `ThemeProvider` + `QueryProvider`
- ✅ Route groups: `(auth)` (login, register) and `(dashboard)` (chat,
  memories, settings)
- ✅ `TopBar.tsx` + `BottomNavBar.tsx` — mobile-first navigation shell,
  theme toggle, gold FAB, active state highlighting
- ✅ `GlassCard.tsx` — reusable glassmorphism primitive
- ✅ Zustand stores: `themeStore`, `userStore`, `chatStore`
- ✅ Type definitions: `user.types.ts`, `chat.types.ts`, `ai.types.ts`
- ✅ Service layer: `api-client.ts`, `auth-service.ts`,
  `conversation-service.ts`, `memory-service.ts`, `chat-service.ts`
- ✅ `npm run build` — clean, zero errors, all 7 routes compiled

## Entry #017 — Stage 5.2: Auth UI
**Date:** June 2026
**Stage:** 5.2 — Auth UI
**Status:** ✅ Complete

### The Challenge
Wire the login and register shells built in Stage 5.1 to the real Stage 2
backend, with proper form validation, loading/error states, and session
persistence that survives a page refresh — without yet having cookie-based
tokens (which would require backend changes deferred to Stage 6).

### Decisions Made
1. **React Hook Form + Zod** — RHF registers inputs via refs, not state,
   meaning the form doesn't re-render on every keystroke. Zod validates as
   a schema, from which both the TypeScript type AND the runtime validation
   are derived from one definition. @hookform/resolvers bridges them:
   errors flow directly into the form's error state.
2. **`useMutation` (TanStack Query) for login/register** — gives isPending,
   isError, error, and isSuccess for free. Register flow: register() →
   login() → me() in a single mutation function — because the backend's
   register endpoint returns the user but not a token (confirmed from
   test_auth.py's actual behavior), so an immediate login call is required.
3. **`_hasHydrated` pattern via Zustand's `onRehydrateStorage`** — Zustand
   sets this to true the moment localStorage has been read. AuthGuard and
   the root page read this boolean directly; no `useEffect` or mount
   tracking needed anywhere. Until `_hasHydrated` is true, auth-guarded
   pages show a gold spinner rather than flashing protected content.
4. **Client-side route protection (AuthGuard), not Edge Middleware** —
   Edge Middleware requires the token to be in a cookie (server-readable).
   Our token lives in localStorage. Moving to cookies is Stage 6 security
   hardening. AuthGuard is an honest, explicit intermediate step, not
   a permanent solution.
5. **Auth layout redirects already-authenticated users** — visiting /login
   or /register while logged in redirects to /chat immediately.

### Lessons Learned
- **Never assume register returns a token** — test_auth.py's actual fixture
  confirmed the shape: register → separate login call. Assuming the API
  contract from a design doc rather than reading the test file would have
  produced a bug on the first real registration attempt.
- **`_hasHydrated` is simpler than a mounted guard** — the common pattern
  of `const [mounted, setMounted] = useState(false)` + `useEffect` is
  unnecessary when Zustand's own `onRehydrateStorage` callback fires at
  exactly the right moment with no extra state.

### Stage Outcome
- ✅ LoginForm + RegisterForm — RHF + Zod validation, loading states,
  API error banners, gold submit button
- ✅ AuthGuard — blocks dashboard routes until hydration is confirmed
- ✅ useLogin + useRegister + useLogout hooks — TanStack mutations
- ✅ userStore updated with _hasHydrated tracking
- ✅ Root page redirect is auth-aware
- ✅ All 12 gate items manually verified

## Entry #018 — Stage 5.3: Chat UI
**Date:** June 2026
**Stage:** 5.3 — Chat UI
**Status:** ✅ Complete

### The Challenge
Build the real chat interface matching the Pyrobot mockup — conversation
list, full-screen chat session, message bubbles, streaming indicator,
model selector, input bar — while connecting to the Stage 4 persistence
layer and handling the edge case of expired JWT tokens gracefully.

### Decisions Made
1. **Separate `(chat)` route group from `(dashboard)`** — the mockup
   explicitly shows no BottomNavBar on the chat session screen. Rather
   than conditionally hiding the nav bar (a fragile `usePathname` check
   deep in a layout), a clean second route group `(chat)/chat/[id]` shares
   the AuthGuard but not the dashboard nav shell. Each group has exactly
   one responsibility — correct by construction, not by condition.
2. **Simulated typewriter via `chatStore.streaming`** — the Stage 4.2
   endpoint returns both messages as JSON once complete. `appendStreamingToken('')`
   starts the streaming state immediately (showing thinking dots), the API
   call fires, and `finalizeStream()` replaces the buffer with the real
   saved message when it lands. This gives visual streaming feedback
   without requiring SSE at this stage. True SSE is the Stage 5.3 fast-
   follow (wiring `chatService.streamMessage`).
3. **Auto-logout on 401 via `api-client.ts`** — the JWT access token
   expires in 15 minutes. Without auto-logout, an expired session would
   silently fail all API calls while Zustand still reported the user as
   authenticated. The fix: on any 401 response, `api-client.ts` calls
   `useUserStore.getState().clearUser()` (Zustand's external state access,
   no hook needed) and redirects to `/login`. This is the first line of
   defense; proper token refresh is Stage 6.
4. **Logout via user avatar in TopBar** — the gold avatar button (showing
   username initial) is both a visual "I'm logged in" indicator and the
   logout trigger. Keeps logout always accessible without a dedicated
   settings route.
5. **TanStack Query key strategy** — conversations list: `['conversations']`,
   messages per conversation: `['messages', id]`. After a successful send,
   both are invalidated so the conversation's `updated_at` surfaces in the
   list without a manual re-fetch.

### Bugs Encountered
**401 Unauthorized blocking all API calls** — JWT from Stage 5.2 testing
had expired by the time Stage 5.3 was being tested. `api-client.ts` threw
`ApiError` on 401 but nothing cleared the stale session or redirected to
login — the app appeared authenticated while the backend correctly rejected
every request. Fixed by adding auto-clear-and-redirect in `api-client.ts`
on any 401 response.

**`currentModel` unused in `ChatTopBar.tsx`** — found the model object by
name but only used `selectedModel` (the id string) in the JSX. Dead
variable removed.

**Stray `package-lock.json` in home directory** — `npm install` run at
`C:\Users\nnata\` at some point left a lockfile that Turbopack detects
as an ambiguous workspace root. Resolved by deleting the file.

### Lessons Learned
- **Route groups as a layout tool** — `(auth)` vs `(dashboard)` vs
  `(chat)` isn't just organizational; each group expresses a different
  layout contract. Adding a third group to express "no nav bar here" is
  far more maintainable than patching an existing layout with conditional
  rendering.
- **JWT expiry is a feature, not a bug** — short-lived tokens are correct
  security behavior. The frontend needs an explicit strategy for expiry
  (auto-logout now, token refresh in Stage 6), not just error handling.
  An expired token silently failing is worse than an error because it
  gives no signal to the user.
- **Zustand outside React** — `useUserStore.getState()` works in any
  TypeScript module, not just components. This means auth-clearing logic
  lives in the API client where it belongs, not scattered across
  components with event emitters or context callbacks.

### Stage Outcome
- ✅ `/chat` — conversation list with empty state, + button creates new
  conversation, list shows real data ordered by `updated_at DESC`
- ✅ `/chat/[id]` — full-screen session: ChatTopBar (back, title, model
  selector), message list (user right / AI left with ✦ icon), thinking
  dots while waiting, StreamingBubble, ChatInputBar
- ✅ Auto-expand textarea, Enter to send, Shift+Enter for newline
- ✅ Copy button on AI bubbles
- ✅ Model selector changes provider for next message
- ✅ 401 auto-logout — expired token clears session and redirects to /login
- ✅ Gold avatar in TopBar — shows username initial, tapping logs out
- ✅ All 11 gate items verified manually
- ✅ `npm run build` — clean, 8 routes, zero errors

### Next Stage
**Stage 5.4 — Conversation Sidebar & Settings**: conversation sidebar
accessible from the chat screen, settings page wired (theme, model
preference, memory management), user profile display.