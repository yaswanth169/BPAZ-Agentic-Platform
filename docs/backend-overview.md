## Backend Overview (`backend/app/`)

This document explains the backend layout and how requests are handled, from FastAPI endpoints through the execution engine and node system.

---

### Tech Stack

- **FastAPI** for HTTP API and dependency injection.
- **Uvicorn** for ASGI server.
- **Pydantic** for request/response models and validation.
- **SQLAlchemy / async DB layer** for PostgreSQL.
- **LangChain** for agents, tools, retrievers, and memory.
- **Python** 3.10+ with async/await.

---

### Directory Structure (Key Parts)

- `backend/app/main.py` (or similar):
  - Creates FastAPI app instance.
  - Includes routers from `app/api`.
  - Adds middleware (logging, CORS, error handling).

- `backend/app/api/`
  - Contains FastAPI routers and endpoints:
    - `chat.py`: chat-related endpoints (send message, get history).
    - `workflows.py`: CRUD and execution for workflows.
    - `variables.py`: environment/secret management.
    - `export.py`, `test_endpoint.py`, etc.: export utilities and test routes.

- `backend/app/core/`
  - **Engine & orchestration**:
    - `engine_v2.py`: core workflow execution engine.
    - `dynamic_node_analyzer.py`: analyzes the workflow graph, computes execution order and dependencies.
    - `execution_queue.py`: manages execution queueing, parallelism, and retries.
    - `workflow_enhancer.py`: builds richer execution context from a request.
  - **State & error handling**:
    - `state.py`: shared state helpers, DB/session helpers, common queries.
    - `error_handlers.py`: structured error/log format.

- `backend/app/nodes/`
  - Each file is a **node** that can be part of a workflow:
    - `base.py`: base node class/interface, common execution helpers and metadata.
    - `agents/react_agent.py`: agent node with Reason + Act loop using tools.
    - `agents/optimized_prompt_builder.py`: builds optimized prompts for agents.
    - `tools/retriever.py`: retriever node for RAG.
    - `memory/conversation_memory.py`, `memory/buffer_memory.py`: conversation and buffer memory nodes.
    - LLM, embeddings, triggers, document loaders, HTTP nodes, etc.
  - Nodes are instantiated by the engine based on workflow JSON and executed with input/output semantics.

- `backend/app/models/`
  - Pydantic and ORM models for:
    - Users, organizations, credentials.
    - Workflows and workflow versions.
    - Executions, logs, chat history, memory.
  - `memory.py`: structures for how memory is stored and retrieved.

- `backend/app/middleware/`
  - `logging_middleware.py`: request/response logging, correlation IDs, timing.
  - Optional custom middlewares for tracing, auth, etc.

---

### How the Backend Handles a Workflow Execution

1. **Request hits FastAPI endpoint**
   - Frontend calls an endpoint in `app/api/workflows.py` (e.g. `execute_adhoc_workflow`).
   - FastAPI parses JSON into request models and injects dependencies (DB session, current user, etc.).

2. **Context creation**
   - `workflow_enhancer.create_context_from_request` is called:
     - Determines `session_id` and `chatflow_id`.
     - Prepares metadata about the user, organization, and environment.

3. **Dynamic node analysis**
   - `dynamic_node_analyzer.py` reads the workflow definition:
     - Validates node types.
     - Builds a dependency graph between nodes.
     - Determines which environment variables and credentials are required for each node.

4. **Engine enqueues workflow**
   - `engine_v2.py` and `execution_queue.py` schedule node execution:
     - Maintains per-execution state (intermediate results, errors).
     - Supports async step execution and possible concurrency where dependencies allow.

5. **Node execution**
   - For each node in execution order:
     - The engine looks up the node implementation in `app/nodes/...`.
     - Instantiates the node class with its config (model name, API keys, etc.).
     - Calls the node’s `run/execute` method with current inputs and context.
   - LLM nodes call external APIs through LangChain.
   - Retriever nodes query vector stores / DB.
   - Memory nodes update conversation/buffer memory.

6. **State persistence**
   - Execution progress, logs, and final outputs are persisted via:
     - `core/state.py` and models in `models/`.
     - PostgreSQL, using async drivers and SQLAlchemy sessions.

7. **Response**
   - Once the engine has final outputs, they are packaged in a response model.
   - FastAPI sends JSON back to the frontend (status, messages, node outputs).

---

### Testing & Export

- `backend/test/`:
  - `test_dynamic_analyzer.py`: ensures dynamic analyzer correctly detects dependencies and environment requirements.
  - `test_docker_export_functionality.py`: checks that workflows can be exported to Dockerized runtimes.
  - `integration_test_scenarios.py`: higher-level scenario tests across multiple nodes and flows.

- `backend/app/routes/export.py`:
  - Implements workflow export logic (e.g. packaging flows and configs for external deployment).

For more detailed, line-level understanding, the best approach is to pick a specific file (e.g. `react_agent.py` or `engine_v2.py`) and walk through it separately.


