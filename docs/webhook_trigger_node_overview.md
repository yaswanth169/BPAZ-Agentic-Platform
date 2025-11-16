## Webhook Trigger Node Backend Overview

This document explains **what `backend/app/nodes/triggers/webhook_trigger.py` does**, how it is wired into the FastAPI app, and how it is used together with the UI and the rest of the platform.

---

### 1. What This File Is

The file `backend/app/nodes/triggers/webhook_trigger.py` implements the **Webhook Trigger node** on the backend.  
It has two main roles:

- **FastAPI router** for webhook HTTP endpoints:  
  - `webhook_router` mounted under `/api/v1/webhooks/...`.
  - Handles incoming HTTP requests from external systems.

- **Node implementation** for workflows:  
  - `WebhookTriggerNode` class, which the engine uses as a **node type** in workflow graphs.
  - Provides metadata, configuration schema, and LangChain `Runnable` integration.

This is the backend counterpart of the **Webhook Trigger node** that you see in the canvas on the frontend.

---

### 2. How It Is Exposed in the API

The file defines a global router:

- **`webhook_router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])`**

This router is included by the main FastAPI app in `backend/app/main.py` so you get endpoints like:

- `GET /api/v1/webhooks/` – health check.
- `GET|POST|PUT|PATCH|DELETE|HEAD /api/v1/webhooks/{webhook_id}` – handle webhook requests for a given webhook.
- `GET /api/v1/webhooks/{webhook_id}/stream` – Server-Sent Events (SSE) stream of webhook events.
- `POST /api/v1/webhooks/{webhook_id}/start-listening` – initialize storage for a webhook.
- `POST /api/v1/webhooks/{webhook_id}/stop-listening` – clear events and subscribers.
- `GET /api/v1/webhooks/{webhook_id}/stats` – statistics for that webhook ID.

**Key function:** `handle_webhook_request(...)`  
All HTTP methods delegate to this function. It:

- Validates the `webhook_id` and auto-creates storage if it looks valid (`wh_...`).  
- Parses the incoming request:
  - JSON bodies for `POST/PUT/PATCH`.
  - Query parameters for `GET`.
  - Path + query for `DELETE/HEAD`.
- Constructs a `webhook_event` dict with:
  - `webhook_id`, `event_type`, `data`, `source`, `timestamp`, request headers, URL, client IP, etc.
- Stores the event in an in-memory `webhook_events` dict (per `webhook_id`) and notifies any subscribers via queues (`webhook_subscribers`).
- Optionally starts a **background workflow execution** (see section 4).
- Returns a `WebhookResponse` Pydantic model as JSON.

---

### 3. How the Node Class Works in Workflows

The class **`WebhookTriggerNode(TerminatorNode)`** is the node type used inside workflow graphs.

When the engine builds a workflow from JSON, a node with:

```json
{
  "id": "webhook_1",
  "type": "WebhookTrigger",
  "data": { "inputs": { ... } }
}
```

is mapped to an instance of `WebhookTriggerNode` on the backend.

Key points about the node:

- **Constructor (`__init__`)**
  - Generates a unique `webhook_id` (e.g. `wh_abc123...`) and `secret_token` (e.g. `wht_xyz...`).
  - Registers an empty event list and subscriber list for that ID:
    - `webhook_events[self.webhook_id] = []`
    - `webhook_subscribers[self.webhook_id] = []`
  - Defines `_metadata` used by the frontend (name, description, inputs, outputs).

- **Inputs (configurable via UI)**
  - `http_method`: GET/POST/PUT/PATCH/DELETE/HEAD (HTTP method to expect).
  - `authentication_required`: whether bearer token auth is required.
  - `allowed_event_types`: optional whitelist of event types.
  - `max_payload_size`, `rate_limit_per_minute`, `enable_cors`, `webhook_timeout`: safety and performance knobs.

- **Outputs (provided back to workflow state/UI)**
  - `webhook_endpoint`: full URL clients should call (e.g. `https://api.example.com/api/v1/webhooks/wh_abc123...`).  
  - `webhook_token`: secret token for Authorization header (if auth is required).  
  - `webhook_runnable`: LangChain `Runnable` that lets flows pull/stream webhook events.  
  - `webhook_config`: full config/metadata object.

- **`execute(...)`**
  - Called when the node is configured or run.  
  - Stores configuration in `self.user_data`.  
  - Computes the full endpoint using `WEBHOOK_BASE_URL` env var or `http://localhost:8000` by default.  
  - Builds `webhook_config` and a `webhook_runnable` via `_create_webhook_runnable`.  
  - Returns the outputs (endpoint URL, token, runnable, config) so the engine and frontend can show them.

- **`_execute(state)`**
  - Used when the node is part of a running graph (LangGraph integration).  
  - Pulls the latest webhook payload associated with this `webhook_id` (from `webhook_events` or `user_data`).  
  - Sets `state.last_output` and returns a dict with `webhook_data`, `webhook_endpoint`, `webhook_token`, etc.

- **`_create_webhook_runnable()`**
  - Creates an internal `WebhookRunnable` class implementing:
    - `invoke`: return latest event for this webhook.  
    - `ainvoke`: async variant.  
    - `astream`: async generator that yields events as they arrive (SSE-like).
  - Adds LangSmith tracing config if `LANGCHAIN_TRACING_V2` is enabled.

---

### 4. Fallback Workflow Execution (Direct Mode)

Inside `handle_webhook_request`, there is a nested async function `execute_webhook_workflow()` that implements a **direct fallback workflow**:

- It runs when a webhook is received and the code chooses to trigger a simple built-in workflow instead of looking up a saved workflow from the DB.
- It constructs an `execution_payload` with:
  - A tiny workflow graph:
    - `StartNode` → `HttpRequest` (GET `https://example.com`) → `EndNode`.
  - `input_text`, `session_id`, `user_id`, and `webhook_data` context.
- It then calls the standard workflow execution API:

```python
api_url = "http://localhost:8000/api/v1/workflows/execute"
async with httpx.AsyncClient() as client:
    response = await client.post(api_url, json=execution_payload, headers=headers, timeout=30)
```

This **does not affect normal user-defined workflows**. It is a safety/demo path used when no specific workflow is bound but you still want to see an end-to-end execution.

---

### 5. How It Connects to the Frontend

On the frontend:

- There is a **Webhook Trigger node** in the node palette (see `client/app/components/nodes/triggers/WebhookTrigger/...` and related types).  
- When you add/configure that node:
  - The frontend sends the node configuration as part of the workflow JSON to the backend.  
  - The engine uses this JSON to instantiate `WebhookTriggerNode`.

When you **save** or **execute** a workflow containing a Webhook Trigger node:

- The node’s `execute(...)` method returns the computed `webhook_endpoint` and `webhook_token`.  
- The frontend displays these so you can copy them into external systems (e.g. `curl`, Stripe webhooks, Zapier/Make, etc.).  
- Incoming HTTP calls to that endpoint show up as events, which are then processed by the workflow chain starting from the Start node.

---

### 6. Summary

- `backend/app/nodes/triggers/webhook_trigger.py` is **the backend implementation of the Webhook Trigger node plus its HTTP API router**.
- It:
  - Creates `/api/v1/webhooks/...` endpoints in FastAPI.  
  - Stores webhook events in memory and can stream them.  
  - Exposes a node class (`WebhookTriggerNode`) used in workflow graphs.  
  - Provides a direct fallback workflow for quick testing when no DB-defined workflow is bound.
- All of this is tightly integrated with the rest of the engine, but **only affects webhook-triggered workflows**, not the rest of the system.


