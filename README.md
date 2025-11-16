# BPAZ-Agentic-Platform

**Visual Agentic Workflows with FastAPI, React, and PostgreSQL**

BPAZ-Agentic-Platform is a full-stack system for building and running AI agents and workflows.  
It provides:
- A **Python FastAPI** backend for orchestration and API.
- A **React (Vite + React Router)** frontend for visual workflow building.
- A **PostgreSQL** database for persistence (workflows, executions, credentials, memory).

This README gives a clean, practical overview of how to set up and understand the project.  
For deep-dive docs, see `docs/architecture-overview.md`, `docs/frontend-overview.md`, and `docs/backend-overview.md`.

---

## 📚 Table of Contents

- **What You Can Build**
- **Architecture Overview**
- **Quick Start (Local Dev)**
- **Environment Variables**
- **Running Backend & Frontend**
- **Docker / Docker Compose**
- **Project Structure**
- **Where to Learn More**

---

## ✨ What You Can Build

- **Visual AI workflows**  
  Drag-and-drop nodes (LLMs, tools, retrievers, memory, agents, triggers) onto a canvas and connect them into end-to-end pipelines.

- **Agentic behaviors**  
  Use React-style agents (Reason + Act) that call tools like retrievers, HTTP clients, and vector stores.

- **RAG pipelines**  
  Build Retrieval-Augmented Generation flows with document loaders, splitters, embeddings, and vector stores.

- **Persistent executions and chat**  
  Store workflows, executions, chat history, and memory in PostgreSQL; inspect past runs and replay them.

- **API-first backend**  
  Use the REST API under `/api/v1` (with Swagger UI at `/docs`) to integrate workflows into other systems.

---

## 🏗 Architecture Overview

At a high level:

- **Frontend (`client/`)**
  - React + Vite app with React Router v7.
  - Workflow canvas powered by `@xyflow/react` (React Flow).
  - Zustand stores for state, Axios/fetch-based `api-client` for backend calls.
  - See `docs/frontend-overview.md` for a full file-by-file explanation and UX flowcharts.

- **Backend (`backend/`)**
  - FastAPI application exposing REST endpoints for workflows, executions, chat, variables, credentials, etc.
  - Core engine (`core/engine_v2.py`, `core/dynamic_node_analyzer.py`, `core/execution_queue.py`) executes workflows as graphs of nodes.
  - Nodes in `app/nodes/` implement LLMs, tools, retrievers, memory, triggers, and more using LangChain.
  - See `docs/backend-overview.md` for an end-to-end description of the backend.

- **Database (PostgreSQL)**
  - Stores users, organizations, workflows, executions, credentials, and vector store data.
  - Migrations and bootstrap logic live in `backend/migrations/database_setup.py`.
  - See `docs/database-and-deployment.md` for DB and deployment details.

- **Embedded Chat Widget (`widget/`)**
  - A lightweight, embeddable chat widget (HTML + JS) that connects to the backend’s chat/workflow APIs.
  - Includes its own `Dockerfile` and `docker-compose.yml` for running the widget as a separate service.
  - See `widget/README.md` for usage, configuration, and how to embed it into external websites.

For a system-level picture and request flow, read `docs/architecture-overview.md`.

---

## ⚡ Quick Start (Local Development)

**Prerequisites**

- **Python** ≥ 3.10
- **Node.js** ≥ 18.15
- **Docker** and **Docker Compose**

### 1. Start PostgreSQL in Docker

```bash
docker run --name bpaz \
  -e POSTGRES_DB=bpaz \
  -e POSTGRES_USER=bpaz \
  -e POSTGRES_PASSWORD=bpaz \
  -p 5432:5432 -d postgres:15
```

### 2. Create environment files

Create `backend/migrations/.env`:

```dotenv
ASYNC_DATABASE_URL=postgresql+asyncpg://bpaz:bpaz@localhost:5432/bpaz
DATABASE_URL=postgresql://bpaz:bpaz@localhost:5432/bpaz
CREATE_DATABASE=true
```

Create `backend/.env`:

```dotenv
ASYNC_DATABASE_URL=postgresql+asyncpg://bpaz:bpaz@localhost:5432/bpaz
DATABASE_URL=postgresql://bpaz:bpaz@localhost:5432/bpaz
CREATE_DATABASE=false
POSTGRES_DB=bpaz
POSTGRES_PASSWORD=bpaz

# Optional LangChain / LangSmith tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=bpaz-agentic-platform-workflows
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
ENABLE_WORKFLOW_TRACING=true
TRACE_MEMORY_OPERATIONS=true
TRACE_AGENT_REASONING=true
```

Create `client/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=/api/v1
VITE_NODE_ENV=development
VITE_ENABLE_LOGGING=true
```

### 3. Install backend dependencies and initialize DB

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r backend/requirements.txt

# Initialize schema (uses backend/migrations/.env)
python backend/migrations/database_setup.py
```

### 4. Run the backend

```bash
python backend/app.py
```

The API should be available at:
- `http://localhost:8000` (API)
- `http://localhost:8000/docs` (FastAPI Swagger UI)

### 5. Run the frontend

```bash
cd client
npm install
npm run dev
```

Open the printed Vite URL (commonly `http://localhost:5173`).

---

## 🔐 Environment Variables (Summary)

You typically manage three `.env` files:

- **`backend/migrations/.env`**  
  Used by migration/bootstrap script to connect to Postgres and create schema.

- **`backend/.env`**  
  Used by the FastAPI app at runtime for DB URLs and optional tracing.

- **`client/.env`**  
  Frontend build-time config: backend base URL, API version, logging flags.

More details and recommended values are documented in `docs/database-and-deployment.md`.

---

## 🐳 Docker & Docker Compose

### Using docker-compose (recommended)

From the repository root:

```bash
docker compose up -d
```

Then open:
- Frontend: usually `http://localhost:5173` or `http://localhost:3000`
- Backend: `http://localhost:8000` (`/docs` for Swagger)

Stop containers:

```bash
docker compose stop
```

### Building and running images manually

```bash
# Build the app image from the project root
docker build --no-cache -t bpaz-agentic-platform:latest .

# Run backend container (adjust ports/envs if needed)
docker run -d --name bpaz-agentic-platform \
  -p 8000:8000 \
  --env-file backend/.env \
  bpaz-agentic-platform:latest
```

For the frontend, you can build and serve the `client` app in a similar containerized setup if desired.

---

## 🧱 Project Structure

```text
BPAZ-Agentic-Platform/
├─ backend/
│  ├─ app.py                    # FastAPI entrypoint
│  ├─ app/                      # Backend modules (API, core engine, nodes, models, middleware)
│  ├─ migrations/
│  │  ├─ database_setup.py      # DB bootstrap / migrations
│  │  └─ .env                   # Migrations env
│  ├─ test/                     # Backend tests
│  └─ requirements.txt
├─ client/
│  ├─ app/                      # Frontend React app (routes, components, stores, services)
│  ├─ public/                   # Static assets
│  ├─ package.json
│  └─ .env                      # Frontend env
├─ widget/
│  ├─ index.html                # Standalone chat widget HTML shell
│  ├─ widget.js                 # Widget logic (UI + integration with backend chat APIs)
│  ├─ Dockerfile                # Container image for the widget
│  ├─ docker-compose.yml        # Optional compose file for running widget service
│  └─ README.md                 # Widget-specific documentation and setup
├─ docs/
│  ├─ architecture-overview.md  # System-level architecture & flows
│  ├─ frontend-overview.md      # Full frontend file-by-file explanation
│  ├─ backend-overview.md       # Backend modules and engine overview
│  └─ database-and-deployment.md# DB and deployment details
├─ docker-compose.yml
├─ Dockerfile                   # Root Docker build
└─ README.md
```

---

## 📘 Where to Learn More

- **System architecture**: `docs/architecture-overview.md`
- **Frontend details**: `docs/frontend-overview.md`
- **Backend details**: `docs/backend-overview.md`
- **Database & deployment**: `docs/database-and-deployment.md`

Those documents are designed to give you a clear mental model of how every part of BPAZ-Agentic-Platform fits together and how requests and data flow through the system.

