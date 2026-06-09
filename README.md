# Pyrobot

> Your AI. Your Way.

A personal AI operating system — built to help you think, learn, create, and organize through a single intelligent interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (latest) · React 19 · TypeScript · Tailwind CSS · shadcn/ui |
| Backend | FastAPI · Python 3.12+ |
| Database | PostgreSQL 17 · SQLAlchemy 2.x · Alembic |
| Auth | JWT · Argon2 password hashing |
| Deployment | Vercel (frontend) · Railway/Render (backend) |

---

## Monorepo Structure

```
pyrobot/
├── frontend/        ← Next.js app
├── backend/         ← FastAPI app
├── docs/            ← Architecture docs
├── scripts/         ← Dev utility scripts
├── docker/          ← Docker configs (future)
├── PROJECT_JOURNAL.md
├── README.md
├── .gitignore
└── .env.example
```

---

## Installation

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 17
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pyrobot.git
cd pyrobot
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

### 4. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Set up the database

```bash
# Create the database (PostgreSQL must be running)
psql -U postgres -c "CREATE DATABASE pyrobot;"
psql -U postgres -c "CREATE USER pyrobot_user WITH PASSWORD 'your-password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE pyrobot TO pyrobot_user;"

# Run migrations
cd backend
alembic upgrade head
```

---

## Local Development

### Start the frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### Start the backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys on push to `main` |
| Backend | Railway or Render | Container deployment |
| Database | Railway PostgreSQL or Supabase | Managed PostgreSQL |

---

## Development Workflow

We use **GitHub Flow**:

1. `main` is always deployable
2. New work → feature branch off `main`
3. Open a Pull Request when ready
4. Review → merge to `main`
5. Auto-deploy triggers

---

## Version Roadmap

| Version | Title | Status |
|---|---|---|
| V1 | AI Assistant | 🔨 In Development |
| V2 | Productivity | Planned |
| V3 | Dev Assistant | Planned |
| V4 | Automation Agent | Planned |
| V5 | AI OS | Future |
