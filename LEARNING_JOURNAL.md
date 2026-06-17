# LEARNING_JOURNAL.md
## Pyrobot — The Developer's Guide

> **Purpose:** This file is your personal curriculum. Every architectural decision, tool, and pattern used to build Pyrobot is explained here from first principles — *why it exists, what problem it solves, and how it works* — so that one day you could rebuild a project like this from scratch, understanding every piece.
>
> Unlike `PROJECT_JOURNAL.md` (which records *what we decided*), this file teaches *the underlying concept* behind each decision, often with analogies and "if we didn't have this, what would go wrong?" framing.
>
> **How to use this file:** Read entries in order for a structured course. Or jump to any topic when you encounter it again later and need a refresher.

---

## Lesson 001 — Why Next.js (App Router) Instead of Plain React?

**The problem plain React has:** A plain React app (e.g., made with Vite) is just a JavaScript file that runs in the browser. The browser has to download *all* the JavaScript before it can show anything, and there's no built-in way to run code on a server.

**What Next.js adds:**
- **File-based routing**: create `app/chat/page.tsx` and `/chat` just works — no router configuration file to maintain.
- **Server Components**: some components render on the server and send only HTML to the browser — less JavaScript shipped, faster initial load.
- **Streaming**: a server can send a response in chunks as it's generated — essential for AI chat, where tokens arrive one at a time rather than all at once.

**Analogy:** Plain React is like getting a flat-pack furniture kit with no instructions — flexible, but you build everything yourself. Next.js is the kit *with* an assembly manual and pre-cut pieces for the common stuff (routing, server communication), so you focus on the unique parts (your actual app).

---

## Lesson 002 — Why FastAPI Instead of Flask?

**The core difference:** Flask, by default, handles one request at a time per worker — if a request is *waiting* for something (like an AI API call that takes 5 seconds), that worker is stuck doing nothing until it's done.

**FastAPI is "async-first"**: using Python's `async`/`await`, a single worker can *pause* a request that's waiting on I/O (network calls, database queries) and handle other requests in that gap, then resume when the wait is over.

**Why this matters for Pyrobot specifically:** When a user sends a chat message, our backend calls OpenAI's API and streams the response back token-by-token. That's a long-lived connection. With Flask, handling many simultaneous chat streams would require many workers (expensive). With FastAPI, one worker juggles many streams efficiently.

**Bonus: Pydantic** — FastAPI uses Pydantic models to define what a valid request/response looks like. If a request doesn't match (wrong types, missing fields), FastAPI rejects it *before* your code even runs, with a clear error message. This is "validation at the boundary" — bad data never enters your business logic.

---

## Lesson 003 — The Provider Pattern (Strategy Pattern)

**The problem:** If every part of your app calls `openai.chat.completions.create(...)` directly, switching to Claude later means finding and rewriting every single one of those calls.

**The solution — define an interface, not an implementation:**

```python
class AIProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list) -> str: ...

    @abstractmethod
    async def stream(self, messages: list) -> AsyncIterator[str]: ...
```

Every AI provider (OpenAI, Claude, Gemini) implements this *same shape*. Your application code calls `provider.generate(messages)` — it doesn't know or care *which* provider it's talking to.

**The factory** picks the right implementation based on config:

```python
def get_provider(model_name: str) -> AIProvider:
    providers = {"gpt-4o": OpenAIProvider, "claude-3-5-sonnet": ClaudeProvider}
    return providers.get(model_name, OpenAIProvider)()
```

**Analogy:** Think of a power adapter. Every appliance (your code) plugs into the *same* socket shape (the `AIProvider` interface). Behind the wall, the actual wiring (OpenAI vs Claude vs Gemini) can be completely different — your appliance never knows or cares.

**Why this is "the most important decision in the project"**: AI models change fast. New, better, cheaper models appear constantly. This pattern means adopting a new one is a 10-minute task (one new file + one factory line), not a week-long refactor.

---

## Lesson 004 — PostgreSQL + JSONB: Relational *and* Flexible

**The problem with pure relational design:** Tables need fixed columns defined in advance. But "user memory" (preferences, learning goals, project context) is inherently *variable* — different users will have wildly different keys and value shapes.

**The problem with pure NoSQL (e.g., MongoDB):** Everything becomes flexible, but you lose the strong guarantees of relational data — e.g., "every message *must* belong to a real conversation, and deleting that conversation *must* delete its messages" (foreign keys + cascade deletes).

**PostgreSQL's JSONB column type gives you both:**
- `users`, `conversations`, `messages` — strict relational tables with foreign keys, because their structure is *known and fixed*.
- `memories.value` — a `JSONB` column — because memory content is *inherently variable* (`{"learning_goal": "..."}` vs `{"tone": "casual"}`).

**Analogy:** It's like a filing cabinet (relational tables) with strict labeled folders for predictable documents, plus one folder that's just a notebook (JSONB) where you can jot down anything in any format — but the notebook still lives *inside* the same cabinet, tied to the right person.

---

## Lesson 005 — Zustand vs Redux: Why "Less" Can Be "More"

**Redux's philosophy**: every state change goes through an "action" → a "reducer" → updates the "store." This is powerful for huge apps with complex, audited state changes, but for a chat app it's a lot of ceremony (action types, action creators, reducers, dispatch) for "add this new message to the list."

**Zustand's philosophy**: a store is just a function that returns state + functions to update it. No actions, no reducers, no providers wrapping your app.

```typescript
const useChatStore = create((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
```

Any component calls `useChatStore((state) => state.messages)` and re-renders only when `messages` changes.

**Why this fits streaming AI responses well**: as tokens stream in, you're calling `addMessage` (or appending to the last message) very frequently. Zustand's minimal overhead and fine-grained subscriptions mean only the message list re-renders — not the whole app.

---

## Lesson 006 — Argon2 vs bcrypt for Password Hashing

**What password hashing does**: never store a password as plain text. Instead, store a one-way "hash" — a scrambled version that's easy to verify against but practically impossible to reverse.

**Why not just any hash (like SHA-256)?** General-purpose hash functions are *fast* — which is bad here. An attacker with stolen hashes can try billions of guesses per second on a graphics card (GPU).

**bcrypt's approach**: deliberately slow, tunable via a "cost factor." Good, and an industry standard for years.

**Argon2's improvement**: it's *memory-hard* — it deliberately uses a lot of RAM during hashing, not just CPU time. GPUs are great at massively parallel *CPU-like* work but have limited memory per parallel unit — so memory-hard functions resist GPU cracking much better than bcrypt. Argon2 won the Password Hashing Competition (2015) and is the current best-practice recommendation (e.g., OWASP).

**Practical takeaway**: `hash_password("my-password")` → stores something like `$argon2id$v=19$m=65536,t=3,p=4$...`. `verify_password("my-password", stored_hash)` → `True`. Your code never sees or stores the plain password after the initial hash.

---

## Lesson 007 — `pydantic-settings`: Why Not Just `os.getenv()`?

**The naive approach:**
```python
import os
db_url = os.getenv("DATABASE_URL")  # returns None if missing — silent failure!
```
If `DATABASE_URL` is missing or misspelled, `db_url` is `None`, and your app might not crash until *much later*, deep inside some database call, with a confusing error.

**The `pydantic-settings` approach:**
```python
class Settings(BaseSettings):
    DATABASE_URL: str  # required, typed as string
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # optional, with default

settings = Settings()  # raises a clear validation error immediately if DATABASE_URL is missing
```
This is "fail fast, fail loud" — if config is broken, the app refuses to even start, with a message telling you exactly which variable is missing or has the wrong type. You find out in *2 seconds* at startup, not 20 minutes into debugging a runtime error.

**`extra="ignore"`**: our `.env` is shared with the frontend (`NEXT_PUBLIC_API_URL`). Without `extra="ignore"`, Pydantic would *also* error on every variable it doesn't recognize. This setting says "if you see something you don't have a field for, just skip it" — making the shared `.env` file possible.

---

## Lesson 008 — Repository → Service → Router: Why Three Layers?

This is the backbone pattern for *every* feature in Pyrobot (auth, chat, memory, etc.).

**Repository layer** — "How do I get/save data?"
```python
async def get_by_email(db, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()
```
Knows SQL/ORM syntax. Knows *nothing* about HTTP, passwords, or business rules.

**Service layer** — "What are the rules?"
```python
async def register_user(db, email, password, name):
    if await user_repo.get_by_email(db, email):
        raise ValueError("Email already registered")
    hashed = hash_password(password)
    return await user_repo.create_user(db, email, hashed, name)
```
Knows business rules ("no duplicate emails"). Doesn't know about HTTP status codes or SQL syntax.

**Router layer** — "What does the HTTP request/response look like?"
```python
@router.post("/register")
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        user = await auth_service.register_user(db, **payload.dict())
    except ValueError as e:
        raise HTTPException(400, str(e))
    return {"success": True, "data": {"user_id": user.id}}
```
Knows HTTP. Translates between the outside world (JSON over HTTP) and the service layer.

**Why split it this way?** Each layer can be tested and changed independently. If you switch databases, only the repository changes. If business rules change ("emails must be verified before login"), only the service changes. If you add a GraphQL API alongside REST, you write new routers but reuse the *same* services and repositories.

**Analogy:** A restaurant. The *kitchen* (repository) prepares food from raw ingredients. The *chef* (service) decides recipes and rules ("no pork in this dish per allergy note"). The *waiter* (router) takes orders from customers and brings food back — translating between "customer language" and "kitchen language," without cooking anything themselves.

---

## Lesson 009 — Docker & Docker Compose: "Why Not Just Install Postgres?"

**The problem with installing PostgreSQL directly on Windows:** it becomes a system-wide service. Version upgrades, multiple projects needing different Postgres versions, and "it works on my machine but not yours" all become painful.

**Docker's idea**: package an application *and everything it needs to run* (OS libraries, the Postgres binary, default configs) into an isolated "container" — a lightweight, sandboxed environment. The container runs identically whether it's on your Windows laptop, a teammate's Mac, or a cloud server.

**Why Docker needs WSL2 on Windows**: Docker containers are fundamentally Linux technology (they use Linux kernel features for isolation). WSL2 (Windows Subsystem for Linux) runs a real, lightweight Linux kernel inside Windows, giving Docker Desktop a Linux environment to run containers in — even though you interact with everything from normal Windows tools (PowerShell, Docker Desktop GUI).

**Docker Compose**: instead of typing a long `docker run` command with many flags, you describe your services declaratively in `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    ports: ["5432:5432"]
    volumes: ["pyrobot_pg_data:/var/lib/postgresql/data"]
```

`docker compose up -d` reads this file and starts everything described. Anyone who clones the repo runs the same command and gets an identical database setup.

**Named volumes**: a container's filesystem is normally *thrown away* when the container stops. A named volume (`pyrobot_pg_data`) is a separate storage area Docker manages, which *persists* even if you delete and recreate the container — this is where your actual database files live.

---

## Lesson 010 — `psycopg3` vs `psycopg2`: The Database Driver

**What a "driver" does**: SQLAlchemy (the ORM) doesn't talk to PostgreSQL directly — it hands off the actual network communication to a driver library. `psycopg` is the most popular PostgreSQL driver for Python.

**psycopg2** (the old version): synchronous only. Using it with `async`/`await` requires workarounds (running it in a thread pool), adding complexity and overhead.

**psycopg3** (`psycopg`, installed as `psycopg[binary]`): has *native* async support — it can `await` a database query directly, fitting naturally into FastAPI's async world.

**Where this shows up**: in your `DATABASE_URL`:
```
postgresql+psycopg://user:password@host:port/dbname
```
The `+psycopg` part tells SQLAlchemy "use the psycopg3 driver for this connection" — without it, SQLAlchemy would default to psycopg2 (if installed) and you'd get confusing async errors.

---

*Next lessons will be added as we build: SQLAlchemy async sessions & the `Base` class, Alembic migrations, JWT tokens, and more.*
