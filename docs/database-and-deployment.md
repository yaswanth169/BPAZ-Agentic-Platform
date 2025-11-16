## Database and Deployment

This document explains how PostgreSQL is used, how the schema is set up, and how the project is typically run with Docker / docker-compose.

---

### Database: PostgreSQL

- The project uses **PostgreSQL** as its primary database.
- It stores:
  - Users, organizations, credentials.
  - Workflows, versions, and metadata.
  - Executions, logs, and chat history.
  - Vector store tables for RAG (if configured).

#### Connection URLs

- Environment variables (example):
  - `DATABASE_URL=postgresql+psycopg2://bpaz:bpaz@localhost:5432/bpaz`
  - `ASYNC_DATABASE_URL=postgresql+asyncpg://bpaz:bpaz@localhost:5432/bpaz`
- These are used by the backend to open sync/async connections.

#### Schema & Migrations

- `backend/migrations/database_setup.py`:
  - Bootstrap script to create the database, roles, and core tables.
  - Uses SQLAlchemy/Alembic-style patterns to define tables and run migrations.
- `backend/app/models/`:
  - ORM models map to tables.
  - Pydantic models map to API schemas.

---

### Docker & docker-compose

- `Dockerfile` (root):
  - Builds a container image for the backend (FastAPI app).
  - Installs Python dependencies and starts Uvicorn.

- `client/Dockerfile`:
  - Builds the frontend React/Vite app.
  - Usually served via a lightweight Node/NGINX container in production setups.

- `docker-compose.yml`:
  - Brings up:
    - Backend service (FastAPI).
    - Frontend service (React/Vite build or dev server).
    - PostgreSQL service (`bpaz` database, user, and password).
  - Configures ports, env vars, and volume mounts for local development.

- `widget/`:
  - Contains a small widget and its own `docker-compose.yml` for embedding the chat widget into other sites.

---

### End-to-End: From Code to Running System

1. **Start PostgreSQL**
   - Use `docker run` or `docker-compose up` to run a Postgres container with DB `bpaz` and user `bpaz`.

2. **Run migrations / setup**
   - Execute `backend/migrations/database_setup.py` (with correct `DATABASE_URL` / `ASYNC_DATABASE_URL`) to ensure DB objects exist.

3. **Run backend**
   - Locally: activate your Python env and run `uvicorn backend.app.main:app --reload`.
   - With Docker: `docker-compose up backend`.

4. **Run frontend**
   - Locally: `cd client && npm install && npm run dev` (ensure `VITE_API_BASE_URL` points to backend).
   - With Docker: `docker-compose up client`.

5. **Use the app**
   - Navigate to the client URL (e.g. `http://localhost:5173`).
   - Sign in / register, create workflows, and run executions.

This ties together the database, backend, and frontend so you can see how data and requests flow through the entire BPAZ Agentic Platform.


