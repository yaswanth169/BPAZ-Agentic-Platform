## Frontend Overview (`client/`)

This document explains the **entire frontend codebase** under `client/`, file by file, and how it is designed and structured.

---

### Tech Stack

- **React** with functional components and hooks.
- **React Router v7** for routing, loaders/actions, and data-driven pages.
- **Vite** as the build tool and dev server.
- **TypeScript** for typing.
- **React Flow (@xyflow/react)** for the workflow canvas and nodes.
- **Zustand** for global state stores.
- **Tailwind / utility CSS classes** for styling.
- **Lucide-react** for icons.
- **Formik** for complex forms (e.g. LLM config).
- **Vitest + Jest** for unit and accessibility tests.

---

### Project Root: `client/`

- **`package.json`**  
  - Defines the client package, scripts, and dependencies.  
  - Scripts: build (`react-router build`), dev (`react-router dev`), tests (`vitest`, `jest`), linting (`eslint`), and Docker/Vercel builds.  
  - Dependencies include React 19, React Router 7, Zustand, React Flow, Formik, Axios, Tailwind, Lucide, CodeMirror, React Query, markdown/LaTeX tooling, etc.

- **`package-lock.json`**  
  - Auto-generated lockfile with exact versions of dependencies for reproducible installs.

- **`Dockerfile`**  
  - Docker build instructions for the frontend image: base image, install deps, build app, define serve command.

- **`DOCKER_README.md`**  
  - Documentation explaining how to run the frontend with Docker (build, run, env vars).

- **`GEMINI.md`**  
  - Notes for integrating or experimenting with Gemini or related models; docs only, not runtime code.

- **`README.md`**  
  - Frontend readme: how to install, run dev, build, test, and key features.

- **`tsconfig.json`**  
  - TypeScript compiler setup: module resolution, strictness, path aliases used throughout `app/`.

- **`vite.config.ts`**  
  - Vite configuration: plugins (Tailwind, TS paths), dev server options, build config.  
  - Integrates with React Router’s build tooling.

- **`vitest.config.ts`**  
  - Vitest configuration: test environment, coverage options, TS path mappings.

- **`jest.config.js`**  
  - Jest configuration (primarily for accessibility tests via `jest-axe`).

- **`lighthouse.config.js`**  
  - Configuration for Lighthouse performance/accessibility audits.

- **`react-router.config.ts`**  
  - Config used by React Router’s build CLI to locate `app/root.tsx` and route modules.

- **`public/`**  
  - Static assets served as-is by Vite:
  - `favicon.ico`, `logo.png`: app icon and logo.  
  - `cohereicon.png`, `emptycredentials.svg`, `emptyexec.svg`: images for illustrations/empty states.  
  - `public/icons/`:
    - `cohere.svg`: Cohere icon for embeddings/rerankers.  
    - `openai.svg`: OpenAI icon for LLM/embeddings nodes.  
    - `postgresql_vectorstore.svg`: icon for vector store nodes.  
    - `tavily_search.svg`, `tavily-nonbrand.svg`: Tavily search icons.

---

### Application Root: `client/app/`

- **`root.tsx`**  
  - Entry point component for the React Router app.  
  - Sets up providers (theme, Zustand), imports `app.css`, and defines the root layout (e.g. `Navbar`, main container, `<Outlet />` for routes).

- **`routes.ts`**  
  - Central route configuration.  
  - Maps URL paths to route modules (`app/routes/*.tsx`) and wires in loaders/actions where needed.

- **`app.css`**  
  - Global CSS/tailwind imports plus any base styles applied across the SPA.

---

### Routes (Pages): `client/app/routes/`

Each file is a page-level component rendered via React Router.

- **`home.tsx`**  
  - Dashboard/landing page; shows overview of workflows, executions, or summary cards.

- **`signin.tsx`**  
  - Sign-in form; calls `authService` to authenticate and updates the `auth` store.

- **`register.tsx`**  
  - Registration form for new users; on success, redirects into the app.

- **`workflows.tsx`**  
  - Lists workflows, allows create/edit/delete, and opens the workflow canvas.  
  - Uses `workflowService` and `workflows` store.

- **`canvas.tsx`**  
  - Full-screen canvas view embedding `FlowCanvas` / `ReactFlowCanvas`.  
  - Focused on building/editing a single workflow graph.

- **`executions.tsx`**  
  - Table/list of executions (runs), with status, timestamps, and drill-down to details.  
  - Uses `executionService` and `executions` store.

- **`variables.tsx`**  
  - Page for managing environment variables/secrets; uses `variableService` and `variables` store.

- **`credentials.tsx`**  
  - Credential management page; renders credential cards and forms.  
  - Uses `userCredentialService` and the credential-related components.

- **`marketplace.tsx`**  
  - Template/Marketplace page listing prebuilt workflow templates (`data/prebuiltTemplates.tsx`).

- **`pinned.tsx`**  
  - Displays pinned workflows/executions/items; uses `pinnedItems` store.

- **`settings.tsx`**  
  - Settings page for user/org preferences: autosave, smart suggestions, theme, etc.

---

### Components: `client/app/components/`

#### Guards and Layout

- **`AuthGuard.tsx`**  
  - Protects private routes; if not authenticated, redirects to signin.  
  - Uses `auth` store.

- **`PublicOnlyGuard.tsx`**  
  - Opposite of `AuthGuard`: prevents authenticated users from visiting public routes (signin/register).

- **`Navbar.tsx`**  
  - Top navigation bar; shows logo, links, user menu, theme toggle.

- **`dashboard/DashboardSidebar.tsx`**  
  - Left navigation sidebar for dashboard sections; lists links to workflows, executions, marketplace, settings.

- **`BackgroundGradient.tsx`**  
  - Decorative component rendering gradient/background effects behind the content.

- **`Loading.tsx`**  
  - Reusable loading indicator (spinner/skeleton) for async states.

#### Common UI: `components/common/`

- **`ChatBubble.tsx`**  
  - Renders an individual chat message (user or assistant) with styling and metadata.

- **`CustomEdge.tsx`**  
  - Custom React Flow edge; controls appearance of connections between nodes.

- **`DataDisplayModes.tsx`**  
  - UI for toggling how data is shown (e.g., raw JSON vs formatted text) in inspector panels.

- **`DraggableNode.tsx`**  
  - Item in the node palette you drag to the canvas.  
  - Maps node types to icons (`nodeTypeIconMap`) and shows name + description.

- **`ErrorBoundary.tsx`**  
  - React error boundary to catch render errors and show fallback UI instead of crashing the app.

- **`FullscreenNodeModal.tsx`**  
  - Fullscreen modal containing node configuration forms (e.g., LLM, retriever, document loader).  
  - Opens on double-click or edit actions on a node.

- **`JSONEditor.tsx`**  
  - JSON editor component using CodeMirror; used for advanced/raw JSON configuration.

- **`NeonHandle.tsx`**  
  - Custom handle component for React Flow with neon glow; used in node visuals to represent input/output ports.

- **`PinButton.tsx`**  
  - Button to pin/unpin items (workflows/executions) using `pinnedItems` store.

- **`PinnedItemsSection.tsx`**  
  - Visual section listing pinned items, used on dashboards or sidebars.

- **`RecommendedNodes.tsx`**  
  - Shows suggested node types near the canvas (based on smart suggestions or frequently used nodes).

- **`Sidebar.tsx`**  
  - Layout component for sidebars containing navigation or node palette content.

- **`TabNavigation.tsx`**  
  - Tabs component for switching between multiple views inside a panel (e.g., Overview / Config / History).

- **`ThemeToggle.tsx`**  
  - Switch between light/dark theme; integrates with `theme` store.

- **`ToggleSwitch.tsx`**  
  - Generic toggle component used across the UI for boolean settings (autosave, suggestions).

#### Canvas & Chat: `components/canvas/`

- **`FlowCanvas.tsx`**  
  - High-level component orchestrating the workflow canvas: layout, sidebars, toolbar, and the React Flow instance.  
  - Wires in node types, edges, selection logic, and connection to the `workflows` and `nodes` stores.

- **`ReactFlowCanvas.tsx`**  
  - Lower-level integration with `@xyflow/react`; registers custom nodes and edges, and handles `onNodesChange`/`onEdgesChange` events.

- **`ChatComponent.tsx`**  
  - Core chat UI: input area, send button, and list of `ChatBubble`s.  
  - Uses `chat` store and `chatService` to interact with backend APIs.

- **`ChatHistorySidebar.tsx`**  
  - Sidebar listing chat sessions or message histories tied to workflows or agents; allows selection of past conversations.

- **`ErrorDisplayComponent.tsx`**  
  - Shows runtime or execution errors near the canvas or execution panels with human-friendly formatting.

- **`SidebarToggleButton.tsx`**  
  - Control to show/hide sidebars (useful on smaller screens).

#### External Embeds: `components/external/`

- **`ExternalWorkflowChat.tsx`**  
  - Chat widget for shared/external workflows; minimal UI for embedding in external pages.

- **`ExternalWorkflowViewer.tsx`**  
  - Read-only workflow viewer for external/public sharing.

#### Modals: `components/modals/`

- **`AutoSaveSettingsModal.tsx`**  
  - Modal to configure autosave behavior for workflows (enable/disable, frequency).

- **`SmartSuggestionsSettingsModal.tsx`**  
  - Modal for configuring AI-based suggestions (whether to enable, how they behave).

- **`UnsavedChangesModal.tsx`**  
  - Warns about unsaved changes when user attempts to navigate away or close modals.

- **`WorkflowEditModal.tsx`**  
  - Edit workflow metadata: name, description, tags.

- **`WorkflowExportModal.tsx`**  
  - UI to export workflows (JSON, Docker bundles); calls `exportService`.

- **`DeleteConfirmationModal.tsx`**  
  - Generic confirmation modal for delete operations (workflows, credentials, etc.).

#### Credentials UI: `components/credentials/`

- **`CredentialCard.tsx`**  
  - Displays a credential summary (service name, status) as a card on the credentials page.

- **`CredentialSelector.tsx`**  
  - Dropdown to select an existing credential for nodes like LLM or embeddings.  
  - Uses `userCredential` store and `userCredentialService`.

- **`DynamicCredentialForm.tsx`**  
  - Builds a credential form dynamically based on `ServiceDefinition` (fields from `types/credentials.ts`).

- **`ServiceSelectionModal.tsx`**  
  - Lets the user pick which service (OpenAI, Cohere, Postgres, Tavily) they are adding a credential for.

#### Nodes: `components/nodes/`

Each node family typically has:
- `...Visual.tsx` – canvas visual.
- `...ConfigForm.tsx` – configuration form.
- `types.ts` – TypeScript types.
- `index.tsx` – wrapper exported to the canvas.

**Agents – `agents/ToolAgent/`**
- `ToolAgentVisual.tsx`: visual representation of a tool-using agent node.  
- `ToolAgentConfigForm.tsx`: config for tools, prompts, model options.  
- `types.ts`, `index.tsx`: types and glue to register the node.

**Document Loaders – `document_loaders/`**
- `DocumentLoader/`:
  - `DocumentLoaderVisual.tsx`: node visual for loading documents.  
  - `DocumentLoaderConfigForm.tsx`: config for source, chunking, metadata.  
  - `types.ts`, `index.tsx`: types and exports.
- `WebScraper/`:
  - `WebScraperVisual.tsx`: visual for a web scraping node.  
  - `WebScraperConfigForm.tsx`: config for URLs, selectors.  
  - `types.ts`, `index.tsx`: definitions and exports.

**Embeddings – `embeddings/OpenAIEmbeddingsProvider/`**
- `OpenAIEmbeddingsProviderVisual.tsx`: embeddings provider visual (OpenAI icon, status indicators).  
- `OpenAIEmbeddingsProviderConfigForm.tsx`: config form for model/credentials and advanced options.  
- `types.ts`, `index.tsx`: types and exports.

**LLMs – `llms/OpenAI/`**
- `ChatDisplayNode.tsx`: OpenAI Chat node visual (icon, title, handles).  
- `ChatConfigForm.tsx`: Formik-based config form for model, temperature, max tokens, API key/credential.  
- `types.ts`, `index.tsx`: types and exports.

**Memory – `memory/BufferMemory/` and `memory/ConversationMemory/`**
- `BufferMemory/`: visual + config for buffer memory (max length, keys).  
- `ConversationMemory/`: visual + config for conversation memory (chat history settings).  
- Each with `types.ts` and `index.tsx`.

**Splitters – `splitters/DocumentChunkSplitter/`**
- Node that splits documents into chunks for RAG; visual + config for chunk size, overlap, strategy.

**Tools – `tools/`**
- `CohereReranker/`, `DocumentReranker/`: nodes for re-ranking search results using specific backends.  
- `HTTPClient/`: generic HTTP request node (GET/POST, headers, body).  
- `RetrieverConfigForm.tsx`, `RetrieverNode.tsx`: generic retriever node config + visual.  
- `TavilyWebSearch/`: Tavily search node with visual and config.

**Triggers – `triggers/`**
- `TimerStartNode/` + `TimerStartNode.tsx`: timer-based trigger node (interval/cron).  
- `WebhookTrigger/`: webhook-trigger node for incoming HTTP events.

**Other & Special**
- `StartNode.tsx`: workflow start node.  
- `other/EndNode.tsx` and `special/EndNode.tsx`: end-of-flow node visuals.  
- `other/GenericNode.tsx`: generic node visual for types without custom visuals.

#### Tutorial and Test Components

- **`tutorial/index.ts`**  
  - Exports tutorial helpers/components.

- **`TutorialButton.tsx`**, **`TutorialLauncher.tsx`**, **`TutorialWorkflowGuide.tsx`**  
  - Components to launch and drive a guided tutorial through building workflows.

- **`components/test/SmartSuggestionsTest.tsx`**  
  - Test/demo harness for smart suggestions, used in dev/test environments.

---

### Data, Lib, Services, Stores, Types

#### `data/`

- **`prebuiltTemplates.tsx`**  
  - Contains pre-defined workflow templates for the marketplace or quick start.

- **`tutorialWorkflows.ts`**  
  - Defines workflows used specifically by the tutorial system.

#### `lib/`

- **`api-client.ts`**  
  - Centralized HTTP client wrapper (Axios/fetch).  
  - Reads `VITE_API_BASE_URL` / `VITE_API_VERSION` from `config.ts`, sets headers, handles errors.

- **`config.ts`**  
  - Frontend configuration: API base URL, version, and flags, derived from environment variables.

- **`dateFormatter.ts`**  
  - Utilities to format timestamps and durations for use in UI components.

- **`clipboard.ts`**  
  - Helper for copying text to clipboard and optionally triggering notifications.

- **`useSSE.ts`**  
  - React hook to consume server-sent events (SSE) streams from the backend (e.g., for streaming logs/chat).

#### `services/`

Services are wrappers around `api-client.ts` for each domain:

- **`authService.ts`**: login, logout, register, fetch current user.  
- **`workflowService.ts` / `workflows.ts`**: list/create/update/delete workflows.  
- **`executionService.ts`**: start executions, fetch execution status and logs.  
- **`chatService.ts`**: send chat messages, retrieve chat history per workflow/session.  
- **`variableService.ts`**: manage environment variables and secrets.  
- **`organizationService.ts`**: read/update organization settings.  
- **`apiKeyService.ts`**: manage API keys for external integrations.  
- **`userCredentialService.ts`**: CRUD for credentials per user.  
- **`nodes.ts`**: retrieve node metadata/palette definitions.  
- **`smartSuggestions.ts`**: request AI-powered smart suggestions from backend.  
- **`externalWorkflowService.ts`**: handle external/shared workflow interactions.  
- **`exportService.ts`**: export workflows (e.g., JSON, Docker artifacts).

#### `stores/` (Zustand State)

Each file defines a Zustand store managing one domain of state:

- **`auth.ts`**: auth status, current user, login/logout actions.  
- **`workflows.ts`**: workflows list, selected workflow, loading flags.  
- **`executions.ts`**: executions list, current execution, streaming status.  
- **`chat.ts`**: chat sessions, messages, loading state.  
- **`variables.ts`**: environment variables and mutations.  
- **`organization.ts`**: active org and its metadata.  
- **`apiKey.ts`**: API key state.  
- **`userCredential.ts`**: loaded credentials and their status.  
- **`nodes.ts`**: available node types/palette metadata.  
- **`pinnedItems.ts`**: pinned workflows/executions and actions to manage them.  
- **`smartSuggestions.ts`**: suggestion settings and cached suggestions.  
- **`theme.ts`**: theme (light/dark) and toggling.

#### `types/`

- **`api.ts`**  
  - Shared TypeScript interfaces for API payloads (workflows, executions, chat messages, etc.).

- **`credentials.ts`**  
  - `ServiceField` and `ServiceDefinition` types and the `SERVICE_DEFINITIONS` array describing each service (OpenAI, Cohere, Postgres, Tavily).

- **`export.ts`**  
  - Types related to workflow export formats and responses.

- **`external-workflows.ts`**  
  - Types for external/shared workflow APIs.

#### `test/`

- **`setup.ts`**  
  - Global test setup for Vitest/Jest: sets DOM environment and jest-dom matchers.

---

### How the Frontend Handles a Typical Workflow Run

1. **User opens a workflow**  
   - `routes/workflows.tsx` uses `workflowService` to fetch workflows.  
   - Selecting a workflow loads it into `FlowCanvas.tsx`.

2. **Canvas renders nodes**  
   - `FlowCanvas.tsx` and `ReactFlowCanvas.tsx` register node types and edges via React Flow.  
   - Node visuals (`GenericNode.tsx`, specific node visuals) and `DraggableNode.tsx` provide the on-canvas representation and palette.

3. **User configures a node**  
   - Double-clicking a node opens `FullscreenNodeModal.tsx` with the relevant config form (e.g., `OpenAI/ChatConfigForm.tsx`).  
   - Formik manages form state and validation; on save it updates stores and backend via services.

4. **User runs workflow**  
   - Run action triggers `executionService` or `workflowService` methods, which use `api-client.ts`.  
   - Execution ID and status are stored in the `executions` store.

5. **Live execution & chat**  
   - `ChatComponent.tsx` and `ChatHistorySidebar.tsx` subscribe to `chat` and `executions` stores, optionally via `useSSE.ts` for streams.  
   - `ChatBubble.tsx` renders messages; `FlowCanvas.tsx` updates node visuals based on status.

This document gives you a complete map of the `client` frontend so you can understand how each file contributes to the overall design and behavior.

---

### End-User Experience Flowchart (Frontend Perspective)

Below is a high-level flow of how an end user moves through the BPAZ Agentic Platform UI and which frontend pieces are involved.

```text
Start (Browser loads app)
        |
        v
[Route: signin.tsx or register.tsx]
        |
   (AuthGuard / PublicOnlyGuard)
        |
        v
[On successful login] --> [root.tsx layout + Navbar + DashboardSidebar]
        |
        v
[Route: home.tsx]
  - Overview of workflows/executions
        |
        +--> User clicks "Workflows"
        |         |
        |         v
        |   [Route: workflows.tsx]
        |     - Uses workflowService + workflows store
        |     - Shows list + "Open in Canvas"
        |         |
        |         v
        |   [Route: canvas.tsx]
        |     - Renders FlowCanvas + ReactFlowCanvas
        |     - Uses nodes store + executions store
        |         |
        |         +--> User drags node (DraggableNode) to canvas
        |         |         |
        |         |         v
        |         |   [Node visual + config forms]
        |         |
        |         +--> User double-clicks node
        |                   |
        |                   v
        |           [FullscreenNodeModal]
        |             - LLM/doc loader/tools config forms
        |
        +--> User clicks "Executions"
        |         |
        |         v
        |   [Route: executions.tsx]
        |     - executionService + executions store
        |
        +--> User clicks "Variables"
        |         |
        |         v
        |   [Route: variables.tsx]
        |     - variableService + variables store
        |
        +--> User clicks "Credentials"
        |         |
        |         v
        |   [Route: credentials.tsx]
        |     - userCredentialService + Credential* components
        |
        +--> User clicks "Marketplace"
                  |
                  v
            [Route: marketplace.tsx]
              - prebuiltTemplates + tutorialWorkflows
```

**Execution & Chat Loop (zoomed-in):**

```text
User presses "Run" on canvas
        |
        v
[FlowCanvas.tsx] --> calls executionService/workflowService
        |
        v
executions store updated (status = running)
        |
        v
[ChatComponent.tsx + ChatHistorySidebar.tsx]
  - Subscribe to chat + executions stores
  - Optionally use useSSE.ts for streaming updates
        |
        v
Chat bubbles update in real time (ChatBubble.tsx)
Node visuals update via ReactFlowCanvas.tsx
        |
        v
Execution finishes (status = completed/error)
        |
        v
User can:
  - Inspect outputs on canvas
  - Re-run workflow
  - Pin results (PinnedItemsSection + PinButton)
  - Export via WorkflowExportModal
```

This flowchart captures the **end-to-end UX** from login, navigation, workflow building, execution, and inspection, along with the core frontend modules involved at each step.

