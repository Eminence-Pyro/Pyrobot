# Pyrobot Architecture

The full architecture specification, component trees, database schema, API contract, and design system are documented in:

**`Pyrobot_Master_Document.docx`** — in the project root / docs folder.

The living development log is in:

**`PROJECT_JOURNAL.md`** — in the project root.

---

## Quick Reference

| Layer | Location | Command |
|---|---|---|
| Frontend | `frontend/` | `npm run dev` → localhost:3000 |
| Backend | `backend/` | `uvicorn app.main:app --reload` → localhost:8000 |
| API Docs | — | localhost:8000/docs |
| DB Migrations | `backend/alembic/` | `alembic upgrade head` |
