# BPAZ-Agentic-Platform

**Build AI Agents & Workflows, Visually — Python backend • React frontend • PostgreSQL**


BPAZ-Agentic-Platform is an open‑source, Flowise‑like visual workflow builder. It ships with a **Python FastAPI** backend, a **React (Vite)** frontend, and a **PostgreSQL** database. You can self‑host locally with Docker or run a classic dev stack (Python venv + Node + Postgres).

---

## 🎬 Showcase

<!-- Inline demo video (GitHub renders HTML) -->

<p>
  <img src="./demo.gif" alt="BPAZ-Agentic-Platform Demo" width="100%" />
</p>

<!-- Screenshot -->

<p>
  <img src="https://github.com/kafein-product-space/BPAZ-Agentic-Platform/blob/readme/demo.png?raw=1" alt="BPAZ-Agentic-Platform Demo" width="100%" />
</p>

---

### 🔗 Quick Links

* **Website (Preview)**: [https://bpaz-agentic-platform-blond.vercel.app](https://bpaz-agentic-platform-blond.vercel.app)
* **API Docs (local)**: [http://localhost:8000/docs](http://localhost:8000/docs) (FastAPI Swagger UI)
* **Star / Fork**: [https://github.com/kafein-product-space/BPAZ-Agentic-Platform](https://github.com/kafein-product-space/BPAZ-Agentic-Platform)

---

## 📚 Table of Contents

* ⚡ Quick Start (TL;DR)
* 🐘 PostgreSQL (Docker)
* 🔐 Environment Variables

  * Backend **migrations** `.env`
  * Backend runtime `.env`
  * Frontend `.env`
* 🧪 Local Development (Python venv / Conda)
* 🧭 VS Code Debugging (`.vscode/launch.json`)
* 🐳 Docker (Compose & Images)
* 🧱 Project Structure
* ✨ App Overview (What you can build)
* 📊 Repository Stats (⭐ Stars & ⬇️ Downloads)
* 🙌 Contributing (with user icons)
* 🆘 Troubleshooting
* 🤝 Code of Conduct
* 📝 License

---

## ⚡ Quick Start (TL;DR)

**Prerequisites**

* **Python** ≥ 3.10
* **Node.js** ≥ 18.15 (Vite)
* **Docker** & **Docker Compose**

```bash
# 1) Start Postgres 15 in Docker (change values if you like)
docker run --name bpaz \
  -e POSTGRES_DB=bpaz \
  -e POSTGRES_USER=bpaz \
  -e POSTGRES_PASSWORD=bpaz \
  -p 5432:5432 -d postgres:15

# 2) Create env files (see sections below for full content)
#    - backend/migrations/.env
#    - backend/.env

# 3) Create virtual environment & install backend deps
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r backend/requirements.txt

# 4) Initialize DB schema (runs inside your local machine)
python backend/migrations/database_setup.py

# 5) Run backend (choose one)
# a) VS Code debug (recommended) — see launch.json section below
# b) Or direct
python backend/app.py

# 6) Frontend
# create client/.env as shown below
cd client && npm install && npm run dev
# Open the printed Vite URL (e.g. http://localhost:5173)
```

> **Tip:** Replace all `bpaz` defaults (DB name/user/password) for your own environment in production.

---

## 🐘 PostgreSQL (Docker)

Run a local Postgres 15 instance. Feel free to change container name/ports.

```bash
docker run --name bpaz \
  -e POSTGRES_DB=bpaz \
  -e POSTGRES_USER=bpaz \
  -e POSTGRES_PASSWORD=bpaz \
  -p 5432:5432 -d postgres:15
```

* Container: `bpaz`
* Host port: `5432` → Container port: `5432`
* Default DB: `bpaz` (change if you want)

---

## 🔐 Environment Variables

BPAZ-Agentic-Platform uses **two backend `.env` files** and **one frontend `.env`**.

> **Path note:** In your editor, `${workspaceFolder}` refers to the repository root.

### 1) Backend **migrations** `.env`

Create: `backend/migrations/.env`

```dotenv
ASYNC_DATABASE_URL=postgresql+asyncpg://bpaz:bpaz@localhost:5432/bpaz
DATABASE_URL=postgresql://bpaz:bpaz@localhost:5432/bpaz
CREATE_DATABASE=true
```

### 2) Backend runtime `.env`

Create: `backend/.env`

```dotenv
ASYNC_DATABASE_URL=postgresql+asyncpg://bpaz:bpaz@localhost:5432/bpaz
DATABASE_URL=postgresql://bpaz:bpaz@localhost:5432/bpaz
CREATE_DATABASE=false
POSTGRES_DB=bpaz
POSTGRES_PASSWORD=bpaz

# LangSmith / LangChain tracing (optional but recommended for debugging)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=bpaz-agentic-platform-workflows
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
ENABLE_WORKFLOW_TRACING=true
TRACE_MEMORY_OPERATIONS=true
TRACE_AGENT_REASONING=true
```

### 3) Frontend `.env`

Create: `client/.env`

```dotenv
# Frontend env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=/api/v1
VITE_NODE_ENV=development
VITE_ENABLE_LOGGING=true
```

---

## 🧪 Local Development (Python venv / Conda)

You can use **venv** or **conda**. Below are both options.

### Option A — venv (recommended for simplicity)

```bash
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1

pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Option B — Conda

```bash
conda create -n bpaz-agentic-platform python=3.10 -y
conda activate bpaz-agentic-platform
pip install -r backend/requirements.txt
```

### Initialize the Database Schema

Ensure your Postgres container is running, then:

```bash
python backend/migrations/database_setup.py
```

### Run the Backend

* **Via VS Code Debugger** (see next section), or
* **Directly**: `python backend/app.py`

### Run the Frontend

```bash
cd client
npm install
npm run dev
# Open the printed Vite URL (e.g. http://localhost:5173)
```

---

## 🧭 VS Code Debugging (`.vscode/launch.json`)

Create the folder: `.vscode/` at the repository root and add `launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Backend Main",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.py",
      "console": "integratedTerminal",
      "env": { "DOTENV_PATH": "${workspaceFolder}/backend/.env" }
    }
  ]
}
```

> If you use the VS Code Python extension’s `envFile` feature instead, you can set `"envFile": "${workspaceFolder}/backend/.env"`.

---

## 🐳 Docker

### Docker Compose (recommended)

If your repo includes a `docker-compose.yml` at the root, simply run:

```bash
docker compose up -d
```

Then open the printed URLs:

* Frontend: e.g. [http://localhost:5173](http://localhost:5173) or [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8000](http://localhost:8000) (Swagger: `/docs`)

Stop containers:

```bash
docker compose stop
```

### Build & Run Images Manually

```bash
# Build the app image from the project root
docker build --no-cache -t bpaz-agentic-platform:latest .

# Run (example for backend image; adjust ports/envs to your Dockerfile)
docker run -d --name bpaz-agentic-platform \
  -p 8000:8000 \
  --env-file backend/.env \
  bpaz-agentic-platform:latest
```

---

## 🧱 Project Structure

```
BPAZ-Agentic-Platform/
├─ backend/
│  ├─ app.py                # FastAPI entrypoint
│  ├─ requirements.txt
│  ├─ .env                  # Backend runtime env
│  └─ migrations/
│     ├─ database_setup.py  # Initializes DB schema
│     └─ .env               # Migrations env
├─ client/
│  ├─ src/
│  ├─ index.html
│  └─ .env                  # Frontend env
├─ docker/                  # (Optional) Docker files
├─ .vscode/
│  └─ launch.json
```

---

## ✨ App Overview (What you can build)

* **Visual AI Workflows**: Drag‑and‑drop nodes (LLM, tools, retrievers, memory, agents). Wire inputs/outputs, set parameters, and persist runs.
* **Observability**: Toggle **LangChain/LangSmith** tracing using the env flags provided (great for debugging prompts and tool calls).
* **PostgreSQL Persistence**: Store workflows, runs, artifacts, and user data in Postgres.
* **REST API**: The backend exposes API routes under `/api/v1` (see Swagger UI at `/docs`).

---

## 📊 Repository Stats (⭐ Stars & ⬇️ Downloads)

### ⭐ Star History (auto‑updated)

[![Star History Chart](https://api.star-history.com/svg?repos=kafein-product-space/BPAZ-Agentic-Platform\&type=Date)](https://star-history.com/#kafein-product-space/BPAZ-Agentic-Platform)

### ⬇️ Downloads — Badges & Table

| Metric                   | Badge                                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **All releases (total)** | ![All Downloads](https://img.shields.io/github/downloads/kafein-product-space/BPAZ-Agentic-Platform/total?label=All%20downloads)                      |
| **Latest release**       | ![Latest Release Downloads](https://img.shields.io/github/downloads/kafein-product-space/BPAZ-Agentic-Platform/latest/total?label=Latest%20downloads) |
| **Stars (live)**         | ![GitHub Repo stars](https://img.shields.io/github/stars/kafein-product-space/BPAZ-Agentic-Platform?style=social)                                     |
| **Forks (live)**         | ![GitHub forks](https://img.shields.io/github/forks/kafein-product-space/BPAZ-Agentic-Platform?style=social)                                          |


## 🙌 Contributing (with user icons)

We welcome PRs! Please:

1. Open an issue describing the change/bug.
2. Fork → create a feature branch.
3. Add/adjust tests where applicable.
4. Open a PR with a clear description and screenshots/GIFs.

### 👥 Contributors 

<a href="https://github.com/kafein-product-space/BPAZ-Agentic-Platform/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kafein-product-space/BPAZ-Agentic-Platform" alt="Contributors" />
</a>

### ⭐ Stargazers & 🍴 Forkers

[![Stargazers repo roster for @kafein-product-space/BPAZ-Agentic-Platform](https://reporoster.com/stars/kafein-product-space/BPAZ-Agentic-Platform)](https://github.com/kafein-product-space/BPAZ-Agentic-Platform/stargazers)
[![Forkers repo roster for @kafein-product-space/BPAZ-Agentic-Platform](https://reporoster.com/forks/kafein-product-space/BPAZ-Agentic-Platform)](https://github.com/kafein-product-space/BPAZ-Agentic-Platform/network/members)

---

## 🆘 Troubleshooting

**Port 5432 already in use**

* Stop any existing Postgres: `docker ps`, then `docker stop <container>`
* Or change the host port mapping: `-p 5433:5432`

**Cannot connect to Postgres**

* Verify envs in both `backend/.env` and `backend/migrations/.env`
* Ensure container is healthy: `docker logs bpaz`

**Migrations didn’t run / tables missing**

* Re-run: `python backend/migrations/database_setup.py`
* Ensure `CREATE_DATABASE=true` in **migrations** `.env` (and `false` in runtime `.env`)

**Frontend cannot reach backend**

* Check `client/.env` → `VITE_API_BASE_URL=http://localhost:8000`
* CORS: ensure backend CORS is configured for your dev origin

**VS Code doesn’t load env**

* Using our snippet? Make sure your app reads `DOTENV_PATH`
* Alternative: VS Code `"envFile": "${workspaceFolder}/backend/.env"`

---

## 🤝 Code of Conduct

Please follow our [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md) to keep the community welcoming.

---

## 📝 License

Source code is available under the **Apache License 2.0** (see `LICENSE`).

---

### ℹ️ Repo Meta (auto‑generated by GitHub)

* Stars, watchers, forks: via badges above
* Contributors facepile: auto‑updated via contrib.rocks
* Star history: auto‑updated via star‑history.com
