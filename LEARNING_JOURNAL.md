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

---

## Lesson 011 — Alembic: A "Diff Tool" for Your Database Schema

**The problem**: SQLAlchemy models describe what your tables *should* look like in Python, but they don't automatically create or update real tables in Postgres. Without something else, you'd be hand-writing `CREATE TABLE` / `ALTER TABLE` SQL every time a model changes.

**What Alembic does**: it compares two things — your model definitions (`Base.metadata`, referred to as `target_metadata`) and the actual current state of the database — and generates a Python script (a "migration") describing the difference. Running `alembic upgrade head` executes that script against the real database.

**Why `target_metadata` has to be set explicitly**: Alembic doesn't automatically know which `Base` belongs to your app. You tell it in `env.py`: `target_metadata = Base.metadata`. Critically, every model file also has to actually be *imported* somewhere before that line runs — otherwise its table doesn't exist yet in Python's eyes, even though the class is written correctly.

**Why you review the autogenerated file, not just run it blindly**: autogenerate is a best-effort diff, not magic. It can miss things like `CHECK` constraints or get an edge-case type change wrong. The generated `upgrade()` / `downgrade()` functions are a draft you commit to git after reading them — not a black box.

**Analogy**: it's `git diff` for your database schema — Alembic shows you what changed and lets you apply (or roll back) that change as one discrete, versioned step, instead of mutating the database by hand and hoping you remember what you did.

---

## Lesson 012 — Reserved Attribute Names: Why `metadata` Broke the App

**The problem**: in plain Python, you can name an instance attribute almost anything. But SQLAlchemy's `DeclarativeBase` (the `Base` every model inherits from) already defines its *own* `metadata` attribute — a `MetaData` object tracking every table SQLAlchemy knows about. Name a column `metadata` on a model, and you're putting two different things under the same name on the same class.

**What actually happens**: SQLAlchemy doesn't quietly let the column win. It raises `InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API` the moment that class body is *defined* — at import time, not when you later use the model.

**Why this stayed hidden for a while**: the error only fires when Python actually executes the class definition, i.e. when something `import`s that file. If nothing in the app happens to import the `Message` model yet (no router, no service, no Alembic wiring), the bug sits there completely invisible while everything else "works."

**The fix**: pick a different Python attribute name (`extra_data` here). You can still name the *database column* `metadata` if you want via `mapped_column("metadata", ...)` — the restriction is only on the attribute name on the class, not the column name in Postgres.

**Broader lesson**: every framework's base class reserves a handful of names (`metadata`, `query`, and `registry` are common SQLAlchemy ones). When a field name feels generic, a five-second check against the base class's own attributes saves a confusing crash later.

---

## Lesson 013 — Character Encoding: Why a "Text File" Can Quietly Break Cross-Platform

**The problem**: a `.txt` file isn't just "text" — it's a sequence of bytes plus an *encoding* that says how to turn those bytes into characters. UTF-8 (one byte per ASCII character) is the web/Linux default. Windows tools sometimes default to UTF-16 instead, where most characters take two bytes — visually identical in an editor, but a structurally different file.

**Where this bit us**: `pip freeze > requirements.txt`, run from PowerShell. PowerShell's `>` redirection has defaulted to UTF-16LE for years — a quirk most Windows developers eventually hit. The file looked completely normal in VS Code, which auto-detects encoding and silently renders it correctly. But `pip install -r requirements.txt` parses the raw bytes expecting UTF-8/ASCII, and would have failed the same way every time on Railway's Linux containers.

**How we caught it**: running `file requirements.txt` in a real shell — it reports the detected encoding explicitly, unlike an editor that just "handles it" for you behind the scenes.

**The robust fix going forward**: pipe through Python instead of trusting PowerShell's redirection, since Python's own file handling is encoding-explicit regardless of OS or shell version:
```powershell
pip freeze | python -c "import sys; open('requirements.txt','w',encoding='utf-8').write(sys.stdin.read())"
```

**Broader lesson**: "it opens fine on my machine" isn't proof a text file is correctly encoded — editors are forgiving in ways command-line tools and other platforms often aren't. When something works locally but fails the same way every time in CI/deployment, check encoding before you check logic.

---

---

## Lesson 014 — Port Collisions: When Two Servers Fight Over the Same Door

**The problem**: a port number (like 5432) isn't owned by "Postgres" specifically — it belongs to whichever process claims it. If two different programs both try to listen on the same port on the same machine, a client connecting to `localhost:5432` has no way of knowing which one actually answered the call.

**Why this is sneaky in practice**: both servers involved here were real, fully working PostgreSQL installations. Neither was broken. The bug wasn't in the code, the driver, or the database — it was that two correct things were occupying the same address, and whichever one happened to answer a given connection had no idea the other one, or its role names and passwords, existed at all.

**The debugging instinct that actually worked**: don't trust an error message's *wording* more than its *evidence*. "Password authentication failed" sounds exactly like a credentials problem, and chasing that directly would mean endlessly re-checking a `.env` file that was correct the whole time. The actual breakthrough came from checking *where the error didn't appear* — Docker's own container log stayed completely silent about the rejected attempts, which is only possible if those attempts never reached that container at all.

**Tools that mattered**:
- `netstat -ano | findstr :PORT` — lists every process bound to a port, by PID. More than one PID means you're not looking at a single-server problem anymore.
- `Get-Process -Id <pid>` — turns a bare PID into a process name.
- `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"` — gets the full executable path and command line. Run this from an **elevated (Administrator)** PowerShell window — a regular session can silently return blank fields for processes it doesn't have full visibility into, which looks identical to "no information exists" but isn't.
- `Get-Service` filtered **by name**, not by PID — PID-based service filters can miss a real, registered service that PID-based process queries find just fine.

**Broader lesson**: "it used to work, then it randomly stopped" is often not random — it's frequently a second, unrelated thing on the same machine that was always lying in wait, only surfacing once both happened to be running at once. Old tutorials, old courses, or earlier unrelated projects leaving native installs behind is a classic source of this on a personal dev machine — which is exactly why Lesson 009's Docker-first decision exists. Docker isolates *your* project's database, but it can't protect you from something else on the same machine claiming the same port first.

---

## Lesson 015 — JWTs: A Token the Server Doesn't Have to Remember

**The problem**: after login, how does the server know who's making the *next* request, without a database lookup on every single one? The classic answer is a server-side session store — but that means every request needs a database round-trip just to confirm identity, before it even gets to doing what the request actually asked for.

**The JWT approach**: a JSON Web Token is three base64 parts — header, payload, signature — glued with dots. The payload (here, just `{"sub": "<user-id>", "exp": <timestamp>}`) is *readable* by anyone who has the token, but not *forgeable*, because the signature is a cryptographic hash of the payload plus a secret only the server knows (`JWT_SECRET`). Change one character of the payload, and the signature no longer matches — `jose.jwt.decode()` raises immediately.

**Why this means "stateless"**: the server never stores "user X is logged in" anywhere. It just hands out a signed claim, and on every later request, re-verifies that signature instead of looking anything up. The token *is* the proof — that's the whole trick.

**The trade-off this creates**: because the server isn't tracking active tokens, there's no built-in way to forcibly log someone out before their token's `exp` naturally arrives — which is exactly why access tokens are kept short-lived (15 minutes here) and why a *separate* refresh-token system with real revocation exists for anything longer-lived. We're deferring that second half intentionally; it's a different problem than "prove who you are right now."

**Where `sub` comes from**: it's a JWT-spec-standard claim name (short for "subject") — using it instead of a made-up field name like `user_id` means any standard JWT library, in any language, already knows how to read it.

---

## Lesson 016 — Repository → Service → Router: Why the Query Doesn't Live in the Route

**The problem**: the fastest way to write `/register` is to put everything in the route function — check the database, hash the password, insert the row, build the token, return it. It works. It also means the moment a second feature needs "is this email already taken," that logic gets copy-pasted into a different file, and the two copies will eventually disagree.

**The three layers, and what each one is *not* allowed to know**:
- **Repository** (`UserRepository`) only knows SQL-shaped questions: get this row, insert that row. It has never heard of Argon2, JWTs, or HTTP status codes.
- **Service** (`AuthService`) knows the business rules — "an email can only be registered once," "a password must verify before you get a token" — but doesn't know it's being called over HTTP at all. It raises plain Python exceptions (`InvalidCredentialsError`) that describe *what* went wrong, not what status code that becomes.
- **Router** (`api/v1/auth.py`) is the only layer that knows about HTTP. Its whole job is catching the service's exceptions and turning each into the right response (`409`, `401`, etc.).

**Why bother, for something this small**: it isn't really about register/login being complex — it's about what happens next. Chat, memory, and file upload will all need "who is the current user," and they'll get it for free from `api/deps.py`'s `get_current_user`, which itself just calls the repository. None of those future features have to know *how* identity is verified; they just depend on the result.

**A concrete test of whether the split is working**: the test suite in `test_auth.py` never imports `argon2` or `jose` directly — it only talks to the API over HTTP, the same way a real client would. If the hashing algorithm changed entirely tomorrow, none of those tests would need to change at all. That's the actual payoff of the layering, not just tidiness.

---

*Next lessons will be added as we build: the `AIProvider` abstract base class and streaming responses in Stage 3.*
---

## Lesson 017 — Server-Sent Events: Keeping the Connection Open

**The problem**: HTTP is request-response by default — the client asks, the server answers, the connection closes. That's fine for a login endpoint. It's a terrible fit for streaming AI responses, where the server needs to send hundreds of small pieces of text over 3–10 seconds.

**What SSE does**: a `text/event-stream` response tells the browser "keep this connection open, I'll keep sending you data." The format is simple plain text — each event is `data: <payload>\n\n`. The browser's `EventSource` API (or a `fetch` with a streaming reader) receives each `\n\n`-terminated chunk as it arrives. The server just writes to the response body whenever it has something to say.

**Why not WebSockets**: WebSockets are bidirectional — the client can also send messages over the same connection. That's necessary for something like a collaborative editor, but for "AI is talking, browser is listening," it adds a handshake, a persistent connection lifecycle, and reconnection logic for zero extra benefit. SSE over HTTP is simpler, works through proxies and CDNs without special configuration, and is what every major AI API (OpenAI, Anthropic) uses for their streaming responses.

**The `[DONE]` sentinel**: when the stream ends, we send `data: [DONE]\n\n` rather than just closing the connection. A clean TCP close doesn't always propagate reliably through load balancers and reverse proxies — a sentinel the frontend can explicitly parse is more robust. This is the same convention OpenAI uses, which is not a coincidence — it means frontend code written for OpenAI's streaming API works identically with Pyrobot's.

---

## Lesson 018 — Mocking at the Right Boundary

**The question**: Stage 3 tests don't call real AI APIs. They mock the provider. Where exactly is the mock applied, and why there?

**Where the mock lives**: `patch("app.services.chat_service.get_provider", return_value=mock_provider)`. This replaces the factory call inside `ChatService.__init__` — every layer *above* that (the router, SSE framing, JWT auth, Pydantic validation, system prompt injection) runs for real. Only the outbound HTTP call to OpenAI/Anthropic/Google is replaced.

**Why not mock at a lower level** (e.g. mock `openai.AsyncOpenAI` directly): it would work, but it would also mean the test knows about OpenAI's internal SDK structure. If the SDK changes a class name, the test breaks even though our code didn't change. Mocking at `get_provider` means the test only knows about our own interface, which is much more stable.

**Why not mock at a higher level** (e.g. mock `ChatService.stream` entirely): then we'd be testing that a mock returns what we told it to return — not very useful. The value of `test_system_prompt_is_prepended` is that it actually runs `ChatService._build_messages()`, which is our code, and confirms the system prompt is in the right place. Mock too high and you lose that.

**The rule of thumb**: mock at the boundary between *your* code and *someone else's* code. The provider is that boundary — everything on the left is Pyrobot, everything on the right is a third-party SDK.

---

---

## Lesson 019 — Repository vs Service: The Commit Boundary Decision

Every repository in Pyrobot has to answer one question: does it commit
its own transaction, or does something else do that?

**The simple rule**, established in `user_repository.py` and documented
in its own comment:

> *"Commits here, not in the service layer: registration is a single
> insert with no other repository calls that need to share its
> transaction. If a future feature needs several writes to succeed or fail
> together, that's the signal to move the commit boundary up."*

**Stage 4.1 proved the rule easy**: creating a conversation is one
insert. `ConversationRepository.create()` commits itself. Simple.

**Stage 4.2 proved why the rule exists**: sending a message is
*four* operations — stage the user's message, call the AI provider,
stage the assistant's reply, touch `conversation.updated_at`. If any
one of these fails, the others shouldn't persist.

Imagine the AI provider throws a quota error on step 3. If the user's
message had already been committed in step 1, it's now sitting in the
database permanently — unanswered, with no way for the user to know
what happened. Better to let the whole thing fail atomically and ask
the user to resend.

**The fix**: `MessageRepository.stage()` does *only* `session.add()`,
no commit. `MessageService.send_message()` owns the single commit point
at the very end, after all four operations have succeeded. If step 3
throws, SQLAlchemy's session closes (via `get_db`'s `finally` block) and
implicitly rolls back — the user's message and the failure disappear
together.

**The naming deliberateness**: the method was called `stage()`, not
`create()`. One repository commits, the other doesn't — giving them the
same method name would be exactly the kind of subtle inconsistency that
causes a bug six months later when someone copies the wrong pattern.

**Analogy**: it's the difference between paying for each course of a
meal individually, or running a tab and paying once at the end. A tab
means if you leave early (the AI call fails), you owe nothing yet.
Paying per course means the kitchen already has your money for the
entree when you discover there's no dessert.

---

## Lesson 020 — `onupdate` Doesn't Do What You Think It Does (for Child Rows)

`TimestampMixin` gives every model `updated_at` with
`onupdate=func.now()`. This sounds like "whenever this record
changes, update the timestamp automatically."

It's subtler than that.

`onupdate` fires when SQLAlchemy flushes a change to a *column on that
specific row*. It does **not** fire when a *child row in a related table*
is inserted. Adding a new `Message` row doesn't change the parent
`Conversation` row at all from Postgres's perspective — so
`conversation.updated_at` stays frozen at creation time forever,
regardless of how many messages are sent.

This matters because Stage 4.1 ordered conversations by `updated_at
DESC` — "most recently active first." Without an explicit update in
Stage 4.2's `send_message()`, a two-year-old conversation you just
replied to would stay buried at the bottom of the list behind one you
created yesterday but never used. Not a crash, not a visible error — just
quietly wrong behavior that would take a real user to notice, not a test.

**The fix**: `conversation.updated_at = datetime.now(timezone.utc)` set
explicitly in `MessageService.send_message()`, before the commit. One
line, tested directly by `test_sending_message_updates_conversation_timestamp`.

**The lesson**: framework magic that "automatically" handles something
usually has a scope that's narrower than you assume. Read the actual
documentation for what triggers it, rather than inferring from what the
name sounds like. When in doubt, be explicit — one line of clear intent
beats one implicit behavior you can't see.

---

## Lesson 021 — The Document-vs-Model Problem: Trust the Migration, Not the Design

Across Stage 4, the same mismatch appeared three separate times: the
planning document (the original `Pyrobot_Master_Document.docx`) said one
thing about the database schema, and the actual, already-applied Alembic
migration said something different.

| Entity | Docx said | Migration actually did |
|---|---|---|
| `conversations` | `title` nullable, `model`/`is_starred` columns | `title NOT NULL`, no `model`, no `is_starred` |
| `messages` | column named `metadata` | column renamed to `extra_data` (SQLAlchemy reserved name conflict, fixed in Entry #007) |
| `memories` | `UNIQUE(user_id, key)` constraint | plain non-unique index on `key` alone |

None of these were failures of planning — they were real decisions made
in the moment of implementation that just weren't reconciled back into
the design document.

**The rule this establishes**: when a planning document and a live model
disagree, the model is *always* right. It's what Alembic actually
applied to the real Postgres instance. Guessing or inferring from an
older doc causes real bugs, not just inconsistencies.

**Why the `memories` case was the most consequential**: the missing
`UNIQUE(user_id, key)` constraint wasn't cosmetic. The upsert pattern
(`PUT /memory/{key}` = "create or update") only works correctly if the
database enforces uniqueness. Without it, nothing stops two rows with the
same `(user_id, key)` from existing simultaneously — and
`.scalar_one_or_none()` (this project's standard query pattern) would
throw `MultipleResultsFound` the moment it tried to read back a
duplicated key, which is a 500 error, not graceful degradation.

**The process that prevented all three from shipping as bugs**:
before writing any service code for a new model, open both the ORM class
file *and* the Alembic migration that actually applied it. They're
different sources of truth and they can disagree. The migration file wins.

---

## Lesson 022 — Database-Native Upserts vs. Check-Then-Write

`PUT /memory/{key}` needs to "create or update" — if the key doesn't
exist yet, insert it; if it already does, overwrite the value.

**The naive approach** (check-then-write):
```python
existing = await session.execute(select(Memory).where(...))
if existing:
    existing.value = new_value
    await session.commit()
else:
    session.add(Memory(...))
    await session.commit()
```
This is correct in a single-user, single-process world. In the real
world, it has a race condition: two simultaneous requests to set the same
key both read "it doesn't exist yet," both try to insert, and one of them
crashes with a unique constraint violation.

**The database-native approach** (Postgres `ON CONFLICT`):
```python
stmt = (
    pg_insert(Memory)
    .values(user_id=user_id, key=key, value=value)
    .on_conflict_do_update(
        index_elements=["user_id", "key"],
        set_={"value": value},
    )
)
await session.execute(stmt)
```
This is one round trip to the database, and it's atomic by construction.
The database handles the conflict resolution internally — two simultaneous
requests can't both "win" the insert, because the conflict resolution
happens inside a single database operation, not across two separate
Python statements.

**What makes this possible**: the `UNIQUE(user_id, key)` constraint added
in Stage 4.4's migration — without it, `ON CONFLICT` has nothing to
conflict on, and the upsert silently falls back to a plain insert every
time (creating duplicates). This is why fixing the constraint at the
schema level was a prerequisite for the service code, not an
afterthought.

**Analogy**: check-then-write is like two people both calling to reserve
the last hotel room at the same moment, both hearing "yes it's available,"
and both showing up expecting a room. `ON CONFLICT` is like a booking
system where only one transaction can hold the reservation at a time —
the second request gets "sorry, just taken" atomically, before it commits
anything.

---

## Lesson 023 — System Prompts and Multi-Provider Gotchas

Every AI provider in Pyrobot uses a "system prompt" — a background
instruction sent with every request that tells the AI who it is and how
to behave. But "system prompt" means structurally different things to
different providers.

**OpenAI and Groq**: the system prompt is just another message in the
messages array, with `role: "system"`. You can add multiple system
messages; they're processed in order.

**Gemini**: the system prompt is a *separate API parameter*, not a
message. `GeminiProvider._build_contents()` extracts any `role="system"`
messages and passes their content to `GenerateContentConfig(system_instruction=...)`. And it does this with a simple overwrite, not an append — if two messages with `role="system"` exist, only the last one's content survives.

This matters for Stage 4.4's memory injection: the naive approach would
be to add a second `{"role": "system", ...}` entry with the user's
memory context. For OpenAI and Groq, this works. For Gemini, it silently
discards either the base personality or the memory context, depending on
order — no error, no warning, just quietly wrong output.

**The fix**: `ChatService._build_messages()` accepts an `extra_context`
parameter that gets appended to the *single, existing* system message
before it's sent. Every provider only ever sees one system message,
regardless of how much extra context is added.

**The broader lesson**: the Provider Pattern (Lesson 003) hides the
differences between providers from the rest of the application — but
you still need to know those differences exist *inside* each provider
implementation. The abstraction works because someone understood what
they were abstracting. "It's all the same interface" is true from the
outside; it's only true on the inside because the adapter layer actively
manages the differences. This is why `gemini_provider.py` deserved a
re-read before extending it, even though it was "already done" and
"already working."

---

## Lesson 024 — Full-Suite Regression Testing: Why Individual Stage Tests Aren't Enough

Every substage in Stage 4 ran its own test file in isolation:
`test_conversations.py`, `test_messages.py`, `test_context_reconstruction.py`,
`test_memory.py`. Every one passed, every time.

The first time `pytest tests/ -v` ran — all files together, for the
first time — it found a real failure: `test_generate_unknown_model_returns_400`
in `test_chat.py`, a Stage 3 test, failing because of a Stage 3 Addendum
change.

The specific bug: the test used `llama-3.3-70b-versatile` as an example of an
"unregistered model name." That was true when the test was written. It
stopped being true the moment the Stage 3 Addendum added Groq to the
factory — at which point `llama-3.3-70b-versatile` became a real,
registered model, and the endpoint correctly returned 200 instead of 400.

No individual stage's tests could have caught this — `test_chat.py` only
ran alongside the Stage 3-era factory, when the test data was still
valid. The regression only became visible when everything ran together.

**What this proves about test data**: "this value doesn't exist" test
fixtures have a useful shelf life only as long as the thing they're
representing as absent stays absent. That's different from a test about
a permanent property ("400 is returned for unknown models") — the
property is still correct, the *data* expressing it went stale.

**The fix principle**: use fixture values that are structurally impossible
to become valid, not just currently invalid. `"definitely-not-a-real-model-xyz"`
can never be accidentally registered; a real provider's old model name
can be, and apparently will be, as the project grows.

**Takeaway**: run the full suite together at every stage boundary, not
just the new stage's tests. Per-stage test runs verify the new code;
full-suite runs verify that the new code doesn't break what was
already proven. Both checks serve different purposes, and neither
substitutes for the other.