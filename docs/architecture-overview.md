## BPAZ Agentic Platform – Architecture Overview

This document explains how the platform works end to end: frontend, backend, and database, and how a typical request flows through the system.

For detailed module notes, see:
- `docs/frontend-overview.md`
- `docs/backend-overview.md`
- `docs/database-and-deployment.md`

---

### High-Level Architecture

- **Frontend**: React + Vite single-page app in `client/`.
  - Renders the workflow canvas, nodes, dashboards, auth forms, etc.
  - Talks to the backend via a typed API client using `fetch`/`axios`-style calls.
  - Manages client-side state with stores (e.g. executions, organization, auth).

- **Backend**: FastAPI app in `backend/app/`.
  - Exposes REST endpoints for auth, workflows, executions, chat, variables, credentials, etc.
  - Uses a **core engine** (`core/engine_v2.py`, `core/dynamic_node_analyzer.py`, `core/execution_queue.py`) to execute workflows and manage node dependencies.
  - Uses **nodes** (`nodes/`) to represent actions: LLMs, tools, retrievers, memory, triggers, vector stores.
  - Integrates **LangChain** for agents, tools, memory, and retrievers.

- **Database**: PostgreSQL
  - Schema defined and migrated via `backend/migrations/database_setup.py` and Alembic-style migration logic.
  - Accessed through SQLAlchemy / async database layer in `backend/app/models/` and `backend/app/core/state.py`.

---

### Typical Request Flow (Frontend → Backend → DB → Back)

1. **User action in the browser**
   - The user clicks or interacts with the React UI (e.g. runs a workflow, edits a node, sends a chat message).
   - A route component (e.g. `client/app/routes/workflows.tsx`, `client/app/components/canvas/FlowCanvas.tsx`, or `client/app/components/canvas/ChatComponent.tsx`) triggers an action.
   - This action calls a function in the API client (`client/app/lib/api-client.ts`) with `VITE_API_BASE_URL` / `VITE_API_VERSION`.

2. **HTTP request to FastAPI backend**
   - The browser sends an HTTP request (JSON payload) to the backend (FastAPI) at `/api/v1/...` endpoints.
   - The request is processed by middleware (`backend/app/middleware/logging_middleware.py`, CORS, error handlers).
   - It is then routed to the appropriate router in `backend/app/api/` (e.g. `workflows.py`, `chat.py`, `variables.py`).

3. **Backend validates & prepares context**
   - FastAPI endpoint code parses the request body into Pydantic models (e.g. workflow execution request).
   - For adhoc or saved workflows, `backend/app/core/workflow_enhancer.py` and `backend/app/core/dynamic_node_analyzer.py` build an **execution context**:
     - Resolve which nodes exist, their types, and their dependencies.
     - Resolve required environment variables and credentials for each node.

4. **Engine enqueues & executes workflow**
   - The request is passed into the **execution engine** (`core/engine_v2.py`, `core/execution_queue.py`):
     - Serialises the workflow graph.
     - Schedules node execution based on dependencies.
     - Uses async queues to process steps in order (or in parallel where allowed).
   - For each node:
     - The engine instantiates a node class from `backend/app/nodes/...` using node configs.
     - Node `run/execute` methods are invoked with the current state (inputs, memory, tool configs).

5. **LLM / Tools / RAG integration**
   - LLM nodes (e.g. `backend/app/nodes/llms/openai_chat.py` or similar) call out to model providers via LangChain.
   - Retriever / vector store nodes (`nodes/tools/retriever.py`, vector store nodes) query the database-backed embeddings.
   - Memory nodes (`nodes/memory/`) read/write conversation or buffer memory to/from state / DB.

6. **Database interactions**
   - Models in `backend/app/models/` represent persisted entities (users, organizations, workflows, executions, credentials, chat history).
   - State and execution data are saved via repository/state helpers in `backend/app/core/state.py` and related modules.
   - PostgreSQL is accessed through async drivers (`asyncpg`) and SQLAlchemy.

7. **Response back to frontend**
   - The engine collects the final output from the workflow (e.g. messages, tool results, node outputs).
   - FastAPI returns a JSON response to the client with execution status and payload.
   - The React app updates the UI:
     - Chat bubbles, execution logs, node highlights, status badges, etc. are rendered from the response.

---

### Key Concepts Mapped to Code

- **Workflows as graphs**:
  - Represented as nodes and edges on the frontend (`FlowCanvas.tsx`, `GenericNode.tsx`, `DraggableNode.tsx`).
  - Serialized to JSON and stored / processed on the backend.

- **Agents (Reason + Act)**:
  - Implemented in `backend/app/nodes/agents/` (e.g. `react_agent.py`, `optimized_prompt_builder.py`).
  - Use LangChain to combine LLMs with tools (retrievers, HTTP calls, custom logic).

- **RAG / Retrievers / Vector Stores**:
  - Frontend: vector store configuration forms (`VectorStoreOrchestrator` components).
  - Backend: `nodes/tools/retriever.py`, PGVector-backed stores, metadata guides in `docs/Vector_Store_Metadata_Guide.md`.

- **Memory**:
  - Backend memory nodes (`nodes/memory/conversation_memory.py`, `nodes/memory/buffer_memory.py`).
  - Frontend chat history UI (`ChatHistorySidebar.tsx`, `ChatComponent.tsx`).

- **Dynamic Node Analyzer**:
  - `backend/app/core/dynamic_node_analyzer.py` inspects the workflow graph:
    - Determines node ordering.
    - Computes environment and credential requirements.
    - Validates that all dependencies are satisfied before execution.

---

This document is intentionally high-level. For more detailed, file-by-file explanations, see the frontend, backend, and database overview docs or request a deep dive into specific modules.


