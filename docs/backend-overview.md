## Backend Overview (`backend/`)

This document explains the **entire backend codebase** under `backend/`: how it is structured, what each module is responsible for, and how requests flow through FastAPI, the core engine, nodes, and PostgreSQL.

---

### Tech Stack

- **FastAPI** for HTTP API and dependency injection.
- **Uvicorn** for ASGI server.
- **Pydantic** for request/response models and validation.
- **SQLAlchemy / async DB layer** for PostgreSQL.
- **LangChain** for agents, tools, retrievers, and memory.
- **Python** 3.10+ with async/await.

---

### Top-Level Backend Files & Folders (`backend/`)

- `app.py`  
  Entry point for running the backend (e.g. `python backend/app.py`). Imports `app.main:app` and starts Uvicorn with appropriate settings.

- `requirements.txt`  
  Python dependencies for the backend (FastAPI, SQLAlchemy, LangChain, async drivers, etc.).

- `docker-compose.yml`  
  Compose file for running the backend together with PostgreSQL.

- `README.md`  
  Legacy backend-specific readme with detailed architecture and API examples. The high-level view is now summarized in this doc and the root `README.md`, but the backend README remains as a reference.

- `webhook-http-integration-guide.md`  
  Guide on integrating external systems via webhooks (endpoints, payloads, security patterns).

- `create_webhook_tables.py`  
  Script to create or update webhook-related tables in the database (used for special setups).

- `migrations/`  
  - `database_setup.py`: main bootstrap script; connects to Postgres via `DATABASE_URL` / `ASYNC_DATABASE_URL` and creates DB objects.  
  - `database_setup.log`: log file produced by `database_setup.py` run (for troubleshooting).

- `test/`  
  - `integration_test_scenarios.py`: end-to-end scenarios combining multiple nodes and workflows.  
  - `test_dynamic_analyzer.py`: tests for `dynamic_node_analyzer` and dependency/env-var detection.  
  - `test_docker_export_functionality.py`: verifies that workflow export to Docker bundles works as expected.  
  - `__init__.py`: package marker.

- `app/`  
  Main backend package; all core code lives here.

---

### Application Entry & Middleware (`backend/app/`)

- `__init__.py`  
  Marks `app` as a Python package.

- `main.py`  
  - Creates the FastAPI application instance.  
  - Registers routers from `app/api/`.  
  - Adds middleware from `app/middleware/` (logging, CORS, error handling).  
  - Defines startup/shutdown events.  
  - This is the module served by Uvicorn: `uvicorn app.main:app`.

- `middleware/`  
  - `__init__.py`: package marker.  
  - `logging_middleware.py`: request/response logging middleware:
    - Logs path, method, status code, latency.  
    - Attaches correlation IDs and can integrate with tracing/monitoring.

---

### API Layer (`backend/app/api/`)

Each file exposes a `FastAPI` `APIRouter` with endpoints for a specific domain.

- `__init__.py`  
  Gathers and exports routers for inclusion in `main.py`.

- `auth.py`  
  Authentication endpoints: login, register, refresh token, and current-user.

- `api_key.py`  
  CRUD operations for API keys (create, list, revoke), used for programmatic access.

- `workflows.py`  
  - Create, read, update, delete workflows.  
  - Endpoints to execute workflows (saved or adhoc) and to inspect definitions.

- `executions.py`  
  - List executions (runs), filter by workflow or status.  
  - Read individual execution details, outputs, and errors.

- `chat.py`  
  - Chat endpoints for conversational flows: send message, get history, manage chat sessions.  
  - Backed by chat models and memory nodes.

- `documents.py`  
  Manage documents for RAG: upload, list, delete, and fetch document metadata.

- `variables.py`  
  CRUD for environment variables/secrets in different scopes (org/user/workflow).

- `credentials.py`  
  - CRUD for stored service credentials (OpenAI, Cohere, Postgres, Tavily, etc.).  
  - Uses encryption helpers to store secrets securely.

- `nodes.py`  
  Returns metadata about available node types, categories, and default configs for the frontend palette.

- `node_configurations.py`  
  Endpoints to persist and retrieve configuration for individual nodes in workflows.

- `node_registry.py`  
  Inspect the node registry: list registered nodes, categories, and capabilities.

- `vectors.py`  
  Vector store APIs: create collections, add documents, perform similarity search.

- `webhooks.py`  
  - Manage webhook endpoints and secrets.  
  - Handle incoming webhook calls (used by `WebhookTrigger` nodes).

- `scheduled_jobs.py`  
  Manage scheduled jobs: timers/cron definitions used by `TimerStartNode`.

- `external_workflows.py`  
  APIs for workflows shared externally (public links, external embedding).

- `http_client.py`  
  Optional helper or proxy endpoints for HTTP client node use-cases.

- `workflow_integration.py`  
  Integration-focused endpoints (e.g. embed workflows into other systems, sync with external tools).

- `schemas.py`  
  Shared or legacy schema utilities for APIs.

- `test_endpoint.py`  
  Simple test/debug endpoints to verify that the backend is alive and routing correctly.

All routers are typically included in `main.py` under a versioned prefix such as `/api/v1`.

---

### Auth Package (`backend/app/auth/`)

- `__init__.py`  
  Package marker.

- `dependencies.py`  
  - FastAPI dependency functions to:
    - Parse and validate JWTs or API keys from headers.  
    - Load the current user and organization.  
  - Used with `Depends(...)` in `api/*.py` to secure routes.

---

### Core Engine & Infrastructure (`backend/app/core/`)

This package houses the core logic for workflow execution, state management, logging, tracing, and security.

#### Configuration & Constants

- `config.py`  
  Pydantic `Settings` class that reads env vars (DB URLs, secrets, log levels, feature flags).

- `constants.py`  
  Shared constant values (node categories, default limits, feature flags, etc.).

#### Database & Connections

- `database.py`  
  - Creates SQLAlchemy/async engines and sessions.  
  - Provides context managers for DB transactions.

- `connection_manager.py`  
  Helpers for managing external connections (e.g. to vector DBs or other services).

#### Engine & Graph

- `engine_v2.py`  
  - Primary workflow execution engine.  
  - Takes a workflow graph + context and executes nodes in dependency order.  
  - Manages async execution, error handling, and aggregation of results.

- `engine.py`  
  - Older or alternative engine kept for backward compatibility or reference.

- `dynamic_workflow_engine.py`  
  - Orchestrator around the engine to support dynamic behaviors (e.g., building and running flows on the fly).

- `graph_builder.py` / `enhanced_graph_builder.py`  
  - Take the serialized workflow (nodes + edges) and build an internal execution graph (optionally LangGraph-compatible).

#### Dynamic Analysis & Orchestration

- `dynamic_node_analyzer.py`  
  - Analyzes the workflow graph to:
    - Validate node types and connections.  
    - Compute execution order (topological sort).  
    - Determine required environment variables and credentials.

- `workflow_enhancer.py`  
  - Builds rich execution context from API requests:
    - Determines `session_id`, `chatflow_id`.  
    - Attaches user/org metadata, variables, and tracing info.

- `execution_queue.py`  
  - Manages queued execution jobs, ordering, and potential parallelism.  
  - Coordinates with engine to process multiple workflows safely.

#### State & Memory

- `state.py`  
  - Core helpers to:
    - Create/update execution records.  
    - Record node inputs/outputs and statuses.  
    - Fetch executions and their state for APIs.

- `state_manager.py`  
  - Higher-level orchestration of execution state transitions.

- `memory_manager.py`  
  - Coordinates memory operations (conversation/buffer) across nodes and sessions.

#### Node Discovery & Registry

- `node_discovery.py`  
  - Scans `app/nodes/` modules to auto-discover node classes and their metadata.

- `node_registry.py`  
  - Maintains in-memory registry of node types, categories, and configuration schemas.  
  - Used by the engine and `api/node_registry.py`.

- `auto_connector.py`  
  - Helper logic to automatically connect nodes or infer compatible connections in some workflows.

#### Credentials, Security, and Encryption

- `credential_provider.py`  
  - Central service to retrieve, decrypt, and provide credentials to nodes during execution.

- `encryption.py`  
  - Encrypt/decrypt sensitive fields (API keys, passwords) using e.g. Fernet.

- `security.py`  
  - Validation and security utilities (e.g. input sanitation, webhook signature checks, permission checks).

#### Logging, Tracing, Performance

- `logging_config.py`, `logging_settings.py`, `logging_utils.py`  
  - Configure Python logging/structlog.  
  - Provide helper functions for consistent, structured logs across the app.

- `enhanced_logging.py`  
  - Higher-level logging patterns for engine, nodes, and APIs.

- `tracing.py`, `enhanced_tracing.py`  
  - Hooks for LangChain/LangSmith tracing and custom tracing of workflow steps.

- `performance_monitor.py`  
  - Collects performance metrics per endpoint or per workflow execution (latency, counts, P95, etc.).

#### Checkpoints, Errors, Exceptions

- `checkpointer.py`  
  - Checkpointing logic that lets long workflows resume from intermediate states.

- `error_handlers.py`  
  - Global FastAPI exception handlers mapping exceptions to structured JSON error responses.

- `exceptions.py`  
  - Custom exception classes (e.g. `WorkflowValidationError`, `NodeExecutionError`).

---

### Data Models (`backend/app/models/`)

SQLAlchemy ORM models define the database schema:

- `base.py`  
  - Declarative Base and common mixins (id, timestamps).

- `user.py` / `organization.py`  
  - Users, organizations, relationships (ownership, membership).

- `auth.py`  
  - Auth-related models (tokens/sessions if needed).

- `workflow.py`  
  - Workflows (name, description, JSON `flow_data`, version, visibility, owner).

- `node.py` / `node_configuration.py` / `node_registry.py`  
  - Persisted node instances and their configs inside workflows.  
  - Registry of known node types (if persisted).

- `execution.py`  
  - Workflow executions: status, inputs, outputs, error messages, timestamps.

- `chat.py`  
  - Chat sessions and messages (role, content, metadata, timestamps).

- `document.py`  
  - Documents ingested into the system (content, metadata, source info).

- `vector_collection.py` / `vector_document.py`  
  - Vector collections and individual vectorized documents (embedding field, metadata).

- `memory.py`  
  - Stored memory entries for workflows/sessions (conversation/buffer snapshots).

- `variable.py`  
  - Environment variables and secrets; scoping rules (global/org/user/workflow).

- `user_credential.py`  
  - Encrypted credentials owned by a user (service type, encrypted payload).

- `api_key.py`  
  - API keys for external programmatic access.

- `scheduled_job.py`  
  - Timer/scheduler jobs backing `TimerStartNode` (cron, interval, etc.).

- `webhook.py`  
  - Webhook endpoints, secrets, and metadata.

- `external_workflow.py`  
  - Externally shared workflows (public links, external access).

---

### Node System (`backend/app/nodes/`)

Nodes are the executable building blocks of workflows.

- `__init__.py`  
  - Package marker and sometimes registry helper.

- `base.py`  
  - Base node classes and interfaces:
    - Common config model.  
    - Input/output handling.  
    - Helper methods for logging, error reporting, state updates.

#### Default Nodes (`nodes/default/`)

- `start_node.py`  
  - Implementation of the Start node; defines the initial output passed into the rest of the graph.

- `end_node.py`  
  - Implementation of the End node; terminates a workflow path and collects final results.

#### Agents (`nodes/agents/`)

- `react_agent.py`  
  - ReAct-style agent node that:
    - Calls an LLM to reason about next actions.  
    - Invokes tool nodes (retrievers, HTTP, etc.) and feeds results back into the LLM.

- `optimized_prompt_builder.py`  
  - Generates optimized prompts based on workflow context, language, and guidelines.

#### LLMs (`nodes/llms/`)

- `openai_node.py`  
  - Node that calls OpenAI chat/completion models through LangChain.  
  - Supports configuration for model name, temperature, max tokens, etc.

#### Tools (`nodes/tools/`)

- `http_client.py`  
  - Makes HTTP requests (GET/POST/PUT/DELETE) to external APIs with headers, body, and error handling.

- `tavily_search.py`  
  - Integrates Tavily web search as a tool node.

- `retriever.py`  
  - Performs vector-based retrieval from configured vector stores (RAG).

- `cohere_reranker.py`  
  - Uses Cohere reranker to reorder retrieved documents by relevance.

#### Memory (`nodes/memory/`)

- `buffer_memory.py`  
  - Buffer memory node; stores a rolling window of messages or events.

- `conversation_memory.py`  
  - Conversation-focused memory; tracks dialogue history, roles, and summaries.

#### Triggers (`nodes/triggers/`)

- `timer_start_node.py`  
  - Timer/cron-based start node; works with scheduled jobs to trigger workflows on a schedule.

- `webhook_trigger.py`  
  - Node that starts a workflow when a configured webhook endpoint is hit.

#### Document Loaders (`nodes/document_loaders/`)

- `document_loader.py`  
  - Loads documents from various sources (files, raw text).

- `web_scraper.py`  
  - Scrapes web pages into text documents.

#### Splitters (`nodes/splitters/`)

- `chunk_splitter.py`  
  - Splits documents into chunks of configurable size/overlap for embedding and retrieval.

#### Embeddings (`nodes/embeddings/`)

- `openai_embeddings_provider.py`  
  - Calls OpenAI embeddings API to generate vector representations for text.

#### Vector Stores (`nodes/vector_stores/`)

- `vector_store_orchestrator.py`  
  - Manages vector store operations: insert/update documents, search by similarity, manage collections.

---

### Schemas (`backend/app/schemas/`)

Pydantic models representing API requests and responses:

- `auth.py`: login, register, token responses.  
- `user.py`: user create/update/response.  
- `organization.py`: organization CRUD schemas.  
- `workflow.py`: workflow create/update/response; includes `flow_data` definitions.  
- `execution.py`: execution responses, status enums.  
- `chat.py`: chat message/session models.  
- `document.py`: document upload and retrieval schemas.  
- `webhook.py`: webhook configuration, payloads, and responses.  
- `variable.py`: environment variable schemas.  
- `user_credential.py`: credential payloads (service ID, fields).  
- `api_key.py`: API key CRUD schemas.  
- `node_configuration.py`: node configuration payload structures.

These schemas are used in `api/*.py` to validate and document endpoints.

---

### Services (`backend/app/services/`)

Encapsulate business logic and database interaction:

- `base.py`  
  Base service class offering shared CRUD helpers and patterns.

- `dependencies.py`  
  FastAPI dependency helpers returning service instances (e.g. `get_workflow_service`).

- `workflow_service.py`  
  Business logic for workflows: create, update, delete, list, validate.

- `execution_service.py`  
  Manage execution records and lifecycle (start, update status, fetch results).

- `chat_service.py`  
  Manage chat sessions/messages and their association with workflows.

- `user_service.py`  
  CRUD for users and account management.

- `document_service.py`  
  Handle document ingestion, indexing, and retrieval.

- `webhook_service.py`  
  Manage webhook endpoints and process incoming webhook events.

- `scheduled_job_service.py`  
  Manage scheduled jobs (timers/cron) and coordinate with `TimerStartNode`.

- `credential_service.py`  
  CRUD for credentials; works with `credential_provider` and `encryption`.

- `variable_service.py`  
  Manage variables and secrets at different scopes.

- `api_key_service.py`  
  Manage API keys for external access.

- `node_registry_service.py`  
  Surface the node registry and metadata to APIs.

- `node_configuration_service.py`  
  Read/write persisted node configuration.

- `memory.py`  
  Service helpers for persistent memory (reading/writing memory models).

APIs typically:

1. Use auth dependencies to get current user/organization.  
2. Call the appropriate service method.  
3. Return a Pydantic schema as the response.

---

### Additional Routes (`backend/app/routes/`)

- `__init__.py`  
  Package marker.

- `export.py`  
  - Implements workflow export logic: bundling workflow definitions, configs, and optionally Docker descriptors.  
  - Used by the frontend “Export workflow” feature.

---

### How the Backend Handles a Workflow Execution (End-to-End)

1. **Request hits FastAPI endpoint**  
   - The frontend or widget calls an endpoint in `app/api/workflows.py` (e.g. `execute_adhoc_workflow`).  
   - FastAPI parses the JSON body into Pydantic models and injects DB sessions and services.

2. **Context creation**  
   - `workflow_enhancer.create_context_from_request` creates an execution context:
     - Determines `session_id`, `chatflow_id`.  
     - Attaches user/org info, variables, and tracing metadata.

3. **Dynamic node analysis**  
   - `dynamic_node_analyzer.py` validates the workflow graph:
     - Ensures node types exist in the registry.  
     - Builds a dependency graph / execution order.  
     - Collects required environment variables and credentials per node.

4. **Engine enqueues workflow**  
   - `engine_v2.py` + `execution_queue.py` create an execution entry and schedule nodes:
     - Keeps track of per-node status and intermediate results.  
     - Supports async execution and parallelism where dependencies allow.

5. **Node execution**  
   - For each node:
     - The engine instantiates the node class from `app/nodes/...` with its configuration.  
     - Calls `run/execute` with current inputs and context.  
   - LLM nodes call external providers via LangChain.  
   - Retriever/vector store nodes query embeddings in Postgres/pgvector.  
   - Memory nodes update conversation/buffer memory via `memory_manager` and `memory.py`.

6. **State persistence**  
   - Execution and node outputs are persisted via `core/state.py` / `state_manager.py` and `models/`.  
   - SQLAlchemy/asyncpg handle persistence to PostgreSQL.

7. **Response to client**  
   - Final outputs (or streamed partial events) are wrapped in response schemas and returned as JSON.  
   - The frontend or widget uses these to update chat UI, canvas statuses, and execution history.

---

### Testing & Export

- **`backend/test/`**
  - `test_dynamic_analyzer.py`: validates dynamic analysis of workflows.  
  - `test_docker_export_functionality.py`: ensures Docker export paths are correct.  
  - `integration_test_scenarios.py`: runs multi-node flows to confirm real-world behavior.

- **`backend/app/routes/export.py`**
  - Implements workflow export endpoints, producing artifacts that can be used outside this runtime.

With this map you can see how the backend is designed: **API layer** → **services** → **core engine + nodes** → **models/DB**, with logging, tracing, and security handled in `core/` and `middleware/`. For deeper, line-by-line understanding, you can now open any specific file (e.g. `engine_v2.py`, `react_agent.py`, `dynamic_node_analyzer.py`) using this overview as your guide.

