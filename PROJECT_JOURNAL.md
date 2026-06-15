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

### Challenge

Introduce API versioning before additional endpoints are implemented.

### Decision

Created a versioned API structure:

api/v1/

Future modules include:

- auth
- chat
- memory
- files

Introduced repositories layer to separate persistence concerns from business logic.

### Outcome

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

Once you confirm these pass, we move immediately into Stage 2 — Backend Foundation: FastAPI scaffolding, PostgreSQL connection, and JWT auth. Are you good to run the fix?You said: instead of using app 14.instead of using app 14.2.x, why not 16.2 which is the latest stable version5 vulnerabilities (1 moderate, 4 high)
To address all issues (including breaking changes), run:
  npm audit fix --force
Run npm audit for details.
npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn allow-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
npm warn allow-scripts
npm warn allow-scripts Run npm approve-scripts --allow-scripts-pending to review, or npm approve-scripts <pkg> to allow.
Success! Created frontend at C:\Users\nnata\Pyrobot\frontend
A new version of create-next-app is available!
You can update by running: npm i -g create-next-app
(venv) PS C:\Users\nnata\Pyrobot>Show more10:27 PMClaude responded: Great catch — and a fair question.Great catch — and a fair question. Let me give you the honest answer.Searched the webSearched the webYou are 100% correct — and I owe you a straight apology and explanation.
I was wrong to recommend 14.2.x. My reasoning was outdated (that was the safe version in late 2024). Here's the truth:
Next.js 16.2.6 is the current stable release as of May 7, 2026. That is exactly what you should be using. Wikipedia
The error you originally hit wasn't a version-too-new problem — it was specifically a canary/preview tag problem (16.3.0-preview.0). That's a different issue entirely. 16.2.x is fully stable and the right choice.

✅ Good News — You're Already on the Right Version
Your terminal output shows the install succeeded cleanly:
Success! Created frontend at C:\Users\nnata\Pyrobot\frontend
No SWC 404. No download failures. That means 16.2 installed correctly on your Windows machine. You're good.
The remaining items to address:
5 vulnerabilities (1 moderate, 4 high) — run this:
powershellcd frontend
npm audit fix
Only use --force if audit fix alone fails, since force can introduce breaking changes.
allow-scripts warning for unrs-resolver — this is safe to approve:
powershellnpm approve-scripts unrs-resolver

📓 Journal Correction Entry
Decision Update — Frontend Framework Version

Next.js 14.2.x → Next.js 16.2.x (stable)
Rationale: 16.2.6 is the current stable LTS. It delivers ~400% faster dev server startup, ~50% faster SSR, and 200+ Turbopack fixes — all direct wins for our streaming AI chat interface. The original 404 error was caused by a canary tag, not the version number itself. Medium

---
---

## Entry #004 — Sprint 0 Addendum: npm Audit & Allow-Scripts Resolution

**Date:** June 2026
**Stage:** Sprint 0 — Frontend Tooling Cleanup
**Status:** ✅ Complete

### The Challenge

After scaffolding completed on Next.js 16.2, `npm audit` reported 2 moderate vulnerabilities (later corrected from an initial misread of "5 vulnerabilities, 1 moderate/4 high" — re-run showed 2 moderate), both stemming from `next`'s internal bundled `postcss` dependency (XSS via unescaped `</style>` in stringify output). Additionally, `sharp` and `unrs-resolver` had pending install scripts blocked by `npm`'s `allowScripts` policy.

### Decisions Made

**Do not run `npm audit fix --force`**

- The suggested force-fix would downgrade `next` from `16.2.x` to `9.3.3` — a ~7 major version regression that would break the entire frontend (App Router, Server Components, Turbopack, everything).
- The vulnerability lives in `next`'s own vendored `postcss` copy, not our direct dependency tree. This is Next.js's responsibility to patch in a future release.
- **Accepted as a known, low-severity, upstream-pending issue.** Re-check on next `npm update` / Next.js patch release.

**Correct allow-scripts syntax**

- `npm approve-scripts <pkg-name>` is not a valid command (caused "Nothing to approve" silently).
- Correct command: `npm approve-scripts --allow-scripts-pending`, which interactively reviews all pending install scripts (`sharp@0.34.5`, `unrs-resolver@1.12.2`) for approval.
- Both packages are legitimate (native binary builds for image optimization and module resolution) — approved.

### Lessons Learned

- `npm audit fix --force` should **never** be run reflexively — always inspect what it proposes to change first (`npm audit` shows the target version before forcing).
- Vulnerabilities in a framework's *own* bundled dependencies are best tracked and waited on, not force-patched by the consumer.
- `npm approve-scripts` requires the `--allow-scripts-pending` flag for interactive review; passing a package name directly does not work as one might assume.

### Stage Outcome

- ✅ npm audit vulnerabilities reviewed and consciously deferred (upstream Next.js issue)
- ✅ `sharp` and `unrs-resolver` install scripts approved via correct command
- ✅ Frontend dependency tree confirmed stable on Next.js 16.2.x — no downgrade

### Deferred Items

- **Mobile device testing via `allowedDevOrigins`**: dev server warns about cross-origin HMR when accessed from phone on local network (e.g., `172.27.49.135`). Revisit when building actual UI screens (Stage 4+), especially Stage 8 (Polish/mobile layout verification). Not needed while only the default boilerplate page exists.

### Next Stage

**Stage 2 — Backend Foundation** (per Entry #003): FastAPI scaffolding, PostgreSQL connection, Alembic migrations, JWT auth with Argon2.

**Gate condition:** Register a user, log in, call `/auth/me` with token successfully via Postman/curl
---

---

## Entry #005 — Stage 2: Backend Foundation (In Progress)

**Date:** June 2026
**Stage:** 2 — Backend Foundation
**Status:** ⏳ In Progress

### The Challenge

Stage 1 (architecture + frontend scaffolding) is complete and verified. Stage 2 requires a running database before any models, migrations, or auth endpoints can be built.

### Decisions Made

**PostgreSQL via Docker Compose (not native install)**

- Docker Desktop installed (v29.5.3) — required enabling WSL2 first via `wsl --install` (elevated Command Prompt), since it wasn't previously installed on this machine.
- `docker-compose.yml` created at project root defining a `postgres:17` service with:
  - Named volume `pyrobot_pg_data` for data persistence across container restarts/recreations
  - Port `5432:5432` mapped to host, so the natively-running FastAPI app can connect via `localhost`
  - Healthcheck via `pg_isready`
  - Credentials sourced from `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) with sane dev defaults

**`DATABASE_URL` driver: `postgresql+psycopg://`**

- The `+psycopg` suffix tells SQLAlchemy 2.x to use psycopg3 (per Sprint 0 decision), not psycopg2.

### Bugs Encountered

**WSL2 not installed / Docker Desktop daemon connection failure**

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
