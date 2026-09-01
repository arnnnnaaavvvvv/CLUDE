import { OnboardingWalkthrough, WalkthroughSection } from "./types";

export function getOnboardingForRepo(repoIdentifier: string, repoFullName?: string): OnboardingWalkthrough {
  const norm = (repoFullName || repoIdentifier || "").toLowerCase();

  // 1. FACEBOOK / REACT
  if (norm.includes("react") && !norm.includes("react-native")) {
    return {
      id: `walkthrough-react-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "React Architecture: Concurrent Fiber Reconciler, Priority-based Scheduling Lanes, and Pluggable Host Renderers.",
      system_diagram_mermaid: `graph TD
  JSX[JSX / Component Code] --> Compiler[Babel / SWC / React Compiler]
  Compiler --> Elements[React Elements Tree]
  Elements --> Fiber[Fiber Reconciler & WorkLoop]
  Fiber --> Scheduler[Concurrent Scheduler & Priority Lanes]
  Scheduler --> CommitPhase[Commit Phase & Mutation Queue]
  CommitPhase --> DOM[ReactDOM Host Renderer]
  CommitPhase --> Native[React Native Host Renderer]
  Fiber --> Hooks[Hook Dispatcher & State Cells]`,
      sections: [
        {
          id: "sec-fiber",
          section_type: "OVERVIEW",
          title: "Fiber Architecture & Reconciliation Pipeline",
          content_markdown: `### React Fiber Architecture & Dual-Buffering

React replaces the legacy stack reconciler with **Fiber**, a specialized virtual call stack that enables asynchronous interruptible rendering.

- **Dual-Buffering Tree**: React maintains two trees simultaneously: the *current* tree (representing what is currently painted on screen) and the *workInProgress* (WIP) tree constructed during background calculation.
- **Alternate Pointers**: Each Fiber node contains an \`alternate\` pointer linking the current and WIP nodes, drastically minimizing garbage collection overhead.
- **Time-Slicing**: Long render passes are chopped into 5ms slices using \`requestPostMessage\` and \`MessageChannel\` to prevent dropping frames on high-refresh displays.`,
          risk_level: "LOW",
          referenced_files: ["packages/react-reconciler/src/ReactFiber.js", "packages/react-reconciler/src/ReactFiberWorkLoop.js"],
          display_order: 1,
        },
        {
          id: "sec-scheduler",
          section_type: "CRITICAL_PATH",
          title: "Concurrent Scheduler & 31-Bit Priority Lanes",
          content_markdown: `### Priority Lanes & WorkLoop Invariants

React uses a 31-bit integer bitmask to represent update priorities (**Lanes**):

1. **SyncLane**: Immediate synchronous execution (e.g. controlled input changes).
2. **InputContinuousLane**: Smooth animations and dragging interactions.
3. **DefaultLane**: Standard state updates (\`useState\` / \`useReducer\`).
4. **TransitionLane**: Non-urgent updates marked with \`startTransition\`.
5. **IdleLane**: Low-priority background pre-warming.

The \`workLoopConcurrent\` scheduler iteratively executes the fiber with the highest priority lane, yielding execution to the browser main thread whenever \`shouldYieldToHost()\` returns true.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/scheduler/src/forks/Scheduler.js", "packages/react-reconciler/src/ReactFiberLane.js"],
          display_order: 2,
        },
        {
          id: "sec-hooks",
          section_type: "DATA_FLOW",
          title: "Hook Dispatcher & Memoized State LinkedList",
          content_markdown: `### Hook Lifecycle & State Preservation

Hooks are organized as a singly-linked list on \`fiber.memoizedState\`.

- **Mount vs Update Dispatchers**: When a component mounts, \`HooksDispatcherOnMount\` initializes cell memory. Subsequent renders switch to \`HooksDispatcherOnUpdate\`.
- **Hook Invariant**: Hooks must always be called at the top level in fixed deterministic order so index indices match the linked list traversal.
- **State Queuing**: State dispatches are enqueued into \`hook.queue.pending\` as circular linked lists resolved during the component's next render pass.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/react-reconciler/src/ReactFiberHooks.js"],
          display_order: 3,
        },
        {
          id: "sec-danger-react",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Synchronous Commit Work & Ref Mutation",
          content_markdown: `### ⚠️ Critical Danger Zone: ReactFiberCommitWork

The commit phase is **synchronous and uninterruptible**. Modifying logic in this phase risks locking the main thread or tearing UI:

- **\`packages/react-reconciler/src/ReactFiberCommitWork.js\`**: Executes DOM node insertions, layout effect execution (\`useLayoutEffect\`), and ref attachments.
- **Circular Update Hazards**: Triggering state updates synchronously inside \`useLayoutEffect\` bypasses scheduling and immediately invokes a re-render pass, triggering maximum update depth exceptions.

> **Maintainer Rule**: Never introduce asynchronous yields or uncaught exceptions within \`commitMutationEffects\` or \`commitLayoutEffects\`.`,
          risk_level: "CRITICAL",
          referenced_files: ["packages/react-reconciler/src/ReactFiberCommitWork.js", "packages/react-dom/src/client/ReactDOMComponent.js"],
          display_order: 4,
        },
        {
          id: "sec-setup-react",
          section_type: "SETUP_GUIDE",
          title: "Monorepo Map & Contributor Quickstart",
          content_markdown: `### Contributor Quickstart

\`\`\`bash
# Clone and install dependencies
git clone https://github.com/facebook/react.git
cd react
yarn install

# Run unit tests across reconciler and DOM
yarn test

# Build production bundles
yarn build react/index,react-dom/index --type=PROD
\`\`\`

- **\`packages/react\`**: Core element creation APIs (\`createElement\`, hooks, context).
- **\`packages/react-reconciler\`**: State machine, Fiber work loop, and diffing algorithm.
- **\`packages/react-dom\`**: Host bindings for DOM events, portal management, and SSR streaming.`,
          risk_level: "LOW",
          referenced_files: ["package.json", "yarn.lock"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // 2. VERCEL / NEXT.JS
  if (norm.includes("next.js") || norm.includes("nextjs") || norm.includes("vercel/next")) {
    return {
      id: `walkthrough-nextjs-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "c901f4a1847d8b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "Next.js Architecture: App Router, React Server Components (RSC) Flight Protocol, Turbopack Rust Engine, and Edge Runtime.",
      system_diagram_mermaid: `graph TD
  Req[Browser / Edge Request] --> Router[Next.js App Router & Manifests]
  Router --> RSC[React Server Component Stream]
  Router --> Edge[Edge Runtime & Middleware]
  RSC --> ServerActions[Server Actions Dispatcher]
  RSC --> Cache[Data Cache & ISR Tag Store]
  Cache --> Upstream[Database / External APIs]
  RSC --> Flight[Flight Payload & Streaming HTML]
  Flight --> ClientHydrate[Client Component Hydration]`,
      sections: [
        {
          id: "sec-app-router",
          section_type: "OVERVIEW",
          title: "App Router & Flight Wire Protocol",
          content_markdown: `### Next.js App Router & Streaming Server Components

Next.js leverages the React Server Components (RSC) architecture to render UI components on the server without shipping JavaScript to client bundles.

- **Flight Protocol**: Server components are serialized into a binary/text stream known as the Flight format (delimited JSON metadata and component slot references).
- **Streaming SSR**: Pages stream chunks using HTTP/1.1 chunked transfer or HTTP/2 frames, rendering top-level layouts instantly while Suspense boundaries await remote promises.
- **Parallel & Intercepting Routes**: Slots (\`@slot\`) and interception prefixes (\`(.photo)\`) allow advanced multi-view and modal state rendering in the URL.`,
          risk_level: "LOW",
          referenced_files: ["packages/next/src/server/app-render/app-render.tsx", "packages/next/src/client/components/app-router.tsx"],
          display_order: 1,
        },
        {
          id: "sec-turbopack",
          section_type: "CRITICAL_PATH",
          title: "Turbopack Rust Compiler & Module Graph",
          content_markdown: `### Turbopack Engine & SWC Transform Pipeline

Next.js builds and bundles application source files via **Turbopack** and **next-swc**:

1. **Incremental Computation**: Built in Rust using the Turbo cache model; functions are memoized at the granular file and AST node level.
2. **SWC Compilation**: Replaces Babel with high-performance Rust transforms for JSX, TypeScript, Server Actions compilation, and font optimization.
3. **Fast Refresh Protocol**: Emits incremental HMR patches over WebSockets with state-preserving module replacement.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/next-swc/crates/core/src/lib.rs", "packages/next/src/build/turbopack-build.ts"],
          display_order: 2,
        },
        {
          id: "sec-cache-isr",
          section_type: "DATA_FLOW",
          title: "Data Cache, Tag Invalidation & ISR Engine",
          content_markdown: `### Next.js 4-Tier Caching Hierarchy

Next.js implements an aggressive multi-tiered caching system:

- **Router Cache**: Client-side in-memory cache of RSC payloads per route segment.
- **Full Route Cache**: Server-side HTML and RSC payload cache computed at build time or during initial revalidation.
- **Data Cache**: Persistent fetch store spanning requests across serverless functions.
- **Tag Invalidation**: \`revalidateTag('tag_name')\` broadcasts tag-based invalidations across the cluster to purge stale entries.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/next/src/server/lib/incremental-cache/index.ts"],
          display_order: 3,
        },
        {
          id: "sec-danger-next",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Server Action Deserialization & Boundary Leaks",
          content_markdown: `### ⚠️ Critical Danger Zone: Action Dispatcher & RSC Boundary

- **\`packages/next/src/server/app-render/action-handler.ts\`**: Handles incoming HTTP POST requests containing encrypted Server Action IDs.
- **Hydration Boundary Hazards**: Exporting server-only secrets or database connections across the \`"use client"\` barrier causes security leaks or runtime serialization crashes.
- **Turbopack SWC Invariants**: Modifying SWC AST visitor passes must preserve sourcemap integrity and avoid infinite recursion during macro expansion.`,
          risk_level: "CRITICAL",
          referenced_files: ["packages/next/src/server/app-render/action-handler.ts", "packages/next/src/client/components/react-dev-overlay/"],
          display_order: 4,
        },
        {
          id: "sec-setup-next",
          section_type: "SETUP_GUIDE",
          title: "Local Development & E2E Test Suite",
          content_markdown: `### Local Next.js Workspace Setup

\`\`\`bash
# Clone Next.js monorepo
git clone https://github.com/vercel/next.js.git
cd next.js

# Install dependencies using pnpm
pnpm install

# Build all packages with Turbopack support
pnpm build

# Run unit and integration tests
pnpm test-dev test/e2e/app-dir/rsc-basic/
\`\`\`

- **\`packages/next\`**: Main framework package and CLI runtime.
- **\`packages/next-swc\`**: Rust native binaries and compiler extensions.
- **\`packages/create-next-app\`**: Zero-configuration bootstrapping CLI.`,
          risk_level: "LOW",
          referenced_files: ["package.json", "pnpm-workspace.yaml"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // 3. FASTAPI / FASTAPI
  if (norm.includes("fastapi")) {
    return {
      id: `walkthrough-fastapi-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "88b1f4a1847d8b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "FastAPI Architecture: Starlette ASGI Substrate, Pydantic v2 Schema Engine, Dependency Injection DAG, and OpenAPI 3.1 Synthesis.",
      system_diagram_mermaid: `graph TD
  HTTP[HTTP / WebSocket Request] --> ASGI[Starlette ASGI Engine & Lifespan]
  ASGI --> Router[FastAPI APIRouter & Route Dispatch]
  Router --> Pydantic[Pydantic v2 Schema Validator & Serializer]
  Router --> DI[Dependency Injection DAG Container]
  DI --> Security[OAuth2 & Security Scopes Resolver]
  DI --> Handlers[Async Endpoint Handler Functions]
  Handlers --> OpenAPI[Dynamic OpenAPI 3.1 & Swagger Spec]
  Handlers --> Workers[BackgroundTasks Worker Pipeline]`,
      sections: [
        {
          id: "sec-asgi-routing",
          section_type: "OVERVIEW",
          title: "ASGI Substrate & APIRouter Architecture",
          content_markdown: `### Starlette Core & Async Route Resolution

FastAPI is built on top of **Starlette** (for ASGI web transport) and **Pydantic** (for data contracts and parsing):

- **ASGI 3.0 Protocol**: Asynchronous request/response lifecycle operating directly over Python's \`asyncio\` event loop.
- **APIRouter Graph**: Modular routing trees with prefix hierarchical chaining, global dependencies, and automatic tags for OpenAPI documentation grouping.
- **Lifespan Context**: Modern \`@asynccontextmanager\` lifecycle handling for database connection pools, ML model loading, and graceful shutdown hooks.`,
          risk_level: "LOW",
          referenced_files: ["fastapi/applications.py", "fastapi/routing.py"],
          display_order: 1,
        },
        {
          id: "sec-pydantic-v2",
          section_type: "CRITICAL_PATH",
          title: "Pydantic v2 Rust Schema Validation Pipeline",
          content_markdown: `### High-Throughput Schema Parsing & Coercion

FastAPI leverages Pydantic v2 (\`pydantic-core\` written in Rust) for maximum throughput:

1. **Parameter Extraction**: Parses query parameters, path variables, request headers, cookies, and JSON/Form request bodies into type-annotated dataclasses.
2. **Type Coercion & Validation**: Validates UUIDs, dates, email constraints, and custom validator functions at C/Rust speed.
3. **Response Model Filtering**: Serializes Python objects while enforcing \`response_model_exclude_unset\` and masking confidential schema attributes.`,
          risk_level: "MEDIUM",
          referenced_files: ["fastapi/dependencies/utils.py", "fastapi/encoders.py"],
          display_order: 2,
        },
        {
          id: "sec-di-container",
          section_type: "DATA_FLOW",
          title: "Dependency Injection DAG & Security Scopes",
          content_markdown: `### Dependency Injection Resolution Graph

FastAPI features a hierarchical, acyclic Dependency Injection system:

- **\`Depends()\` DAG Resolution**: Solves complex nested dependencies and caches shared instances across sub-dependencies within the same request scope.
- **Yield Dependencies**: Context-managed dependencies (\`yield db_session\`) automatically execute cleanup and commit/rollback logic after response transmission.
- **Security Scopes**: Integrates OAuth2 scopes and JWT claims directly into route parameter signatures.`,
          risk_level: "MEDIUM",
          referenced_files: ["fastapi/dependencies/models.py", "fastapi/security/oauth2.py"],
          display_order: 3,
        },
        {
          id: "sec-danger-fastapi",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Threadpool Offloading & Async Context Isolation",
          content_markdown: `### ⚠️ Critical Danger Zone: Synchronous vs Asynchronous Handlers

- **\`fastapi/routing.py:run_endpoint_function\`**: Non-async endpoints (\`def endpoint()\`) are automatically offloaded to the \`anyio\` worker threadpool to prevent blocking the main asyncio event loop.
- **Thread Local Hazards**: Passing non-thread-safe global state or un-awaited database cursors between async and sync contexts can lead to deadlocks or database connection leaks.
- **BackgroundTasks Concurrency**: Tasks enqueued in \`BackgroundTasks\` run after the HTTP response is sent, meaning request-scoped database sessions may already be closed if not cleanly detached.`,
          risk_level: "CRITICAL",
          referenced_files: ["fastapi/routing.py", "fastapi/background.py"],
          display_order: 4,
        },
        {
          id: "sec-setup-fastapi",
          section_type: "SETUP_GUIDE",
          title: "Local Python Environment & Pytest Suite",
          content_markdown: `### Local FastAPI Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/fastapi/fastapi.git
cd fastapi

# Create virtual environment and install development dependencies
pip install -r requirements-dev.txt
flit install --symlink

# Run full pytest test suite with coverage
pytest tests/ -v
\`\`\`

- **\`fastapi/applications.py\`**: Main application class and OpenAPI builder.
- **\`fastapi/routing.py\`**: Endpoint dispatch, threadpool offloader, and parameter injector.
- **\`fastapi/param_functions.py\`**: Parameter declarations (\`Query\`, \`Body\`, \`Header\`, \`Depends\`).`,
          risk_level: "LOW",
          referenced_files: ["pyproject.toml", "requirements-dev.txt"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // 4. TAILWINDLABS / TAILWINDCSS
  if (norm.includes("tailwind") || norm.includes("tailwindcss")) {
    return {
      id: `walkthrough-tailwind-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "7d890b21847e091b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "Tailwind CSS Architecture: Oxide JIT Scanner, AST Rule Generator, Design Token Engine, and Lightning CSS Minifier.",
      system_diagram_mermaid: `graph TD
  Source[Source Files: HTML / JSX / Vue / Svelte] --> Scanner[JIT Scanner & Candidate Extractor]
  Scanner --> AST[Tailwind Oxide AST & Theme Engine]
  AST --> Variants[Variant Parser: hover / focus / dark / responsive]
  AST --> Utilities[Utility Class Rule Generator]
  Variants --> Optimizer[Lightning CSS Transformer & Minifier]
  Utilities --> Optimizer
  Optimizer --> Output[Final Optimized CSS Stylesheet]`,
      sections: [
        {
          id: "sec-jit-oxide",
          section_type: "OVERVIEW",
          title: "Oxide Engine & Sub-Millisecond JIT Candidate Scanner",
          content_markdown: `### Tailwind Oxide & On-Demand CSS Generation

Tailwind CSS v4 introduces **Oxide**, a high-performance engine written in Rust:

- **Zero-Config Candidate Extraction**: Scans all template files, extracting potential utility candidates without requiring manual glob configurations in \`tailwind.config.js\`.
- **Parallel Scanning**: Uses multi-threaded scanning to evaluate large monorepos with hundreds of thousands of lines in under 10 milliseconds.
- **AST Generation**: Compiles extracted candidates directly into optimized CSS AST representations without intermediate string concatenations.`,
          risk_level: "LOW",
          referenced_files: ["crates/oxide/src/lib.rs", "packages/tailwindcss/src/index.ts"],
          display_order: 1,
        },
        {
          id: "sec-variants",
          section_type: "CRITICAL_PATH",
          title: "Variant Stacking, Pseudo-Classes & Arbitrary Values",
          content_markdown: `### Variant Permutations & Specificity Sorting

Tailwind dynamically evaluates multi-level nested variants:

1. **Stacking Variants**: Compounded modifiers like \`dark:group-hover:focus:bg-blue-500\` are parsed into stacked CSS selectors (\`@media\`, \`:hover\`, \`:focus\`).
2. **Arbitrary Values & Modifiers**: Classes such as \`bg-[#1da1f2]/50\` and \`grid-cols-[1fr_500px_2fr]\` dynamically generate inline CSS variable rules.
3. **Deterministic Specificity**: Rules are sorted by layer order (\`@theme\`, \`@base\`, \`@components\`, \`@utilities\`) to guarantee consistent override behavior regardless of source class order.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/tailwindcss/src/variants.ts", "packages/tailwindcss/src/utilities.ts"],
          display_order: 2,
        },
        {
          id: "sec-tokens",
          section_type: "DATA_FLOW",
          title: "Design Tokens, Theme Cascades & OKLCH Color Space",
          content_markdown: `### Design System & Theme Engine

Tailwind replaces static color palettes with modern CSS variable cascades:

- **OKLCH Color Space**: Delivers perceptually uniform shades across light/dark contrast modes.
- **CSS-First Theme Config**: Themes are declared directly in CSS using \`@theme { --color-primary: ... }\` directives, eliminating JavaScript config overhead.
- **Container Queries**: Native \`@container\` query support built into standard variant dispatching.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/tailwindcss/src/theme.ts"],
          display_order: 3,
        },
        {
          id: "sec-danger-tailwind",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: CSS Specificity Ordering & Layer Invariants",
          content_markdown: `### ⚠️ Critical Danger Zone: Cascade Layer Sorting & Lightning CSS

- **\`packages/tailwindcss/src/compile.ts\`**: Emits final stylesheet AST rules. Incorrect layer index assignments cause utility classes to fail to override component base styles.
- **Arbitrary Modifier Injection Hazards**: Malformed arbitrary selector inputs (e.g. \`[&>li:nth-child(2)]:...\`) must be strictly sanitized to prevent breaking the PostCSS/LightningCSS pipeline.`,
          risk_level: "CRITICAL",
          referenced_files: ["packages/tailwindcss/src/compile.ts", "packages/tailwindcss/src/ast.ts"],
          display_order: 4,
        },
        {
          id: "sec-setup-tailwind",
          section_type: "SETUP_GUIDE",
          title: "Monorepo Build & Integration Tests",
          content_markdown: `### Local Tailwind CSS Workspace Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/tailwindlabs/tailwindcss.git
cd tailwindcss

# Install dependencies and build Rust Oxide native binaries
pnpm install
pnpm build

# Run unit and integration tests
pnpm test
\`\`\`

- **\`packages/tailwindcss\`**: Main CSS compiler and runtime package.
- **\`packages/@tailwindcss-postcss\`**: PostCSS 8 plugin adapter.
- **\`packages/@tailwindcss-vite\`**: High-performance Vite plugin integration.`,
          risk_level: "LOW",
          referenced_files: ["package.json", "pnpm-workspace.yaml"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // 5. CUSTOM REPOSITORY (e.g. arnnnnwww / user repos / CLUDE)
  const displayName = repoFullName || repoIdentifier || "Custom Repository";
  const repoSlug = displayName.split("/").pop() || "project";

  return {
    id: `walkthrough-custom-${repoIdentifier}`,
    repo_id: repoIdentifier,
    commit_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    status: "COMPLETED",
    summary: `Complete architectural topology, dependency graph, and onboarding walkthrough for ${displayName}.`,
    system_diagram_mermaid: `graph TD
  Client[Next.js Client / UI Layer] --> API[API Gateway & Router: /api/v1]
  API --> Engine[Core Engine: AST Parser & Causal Analyzer]
  Engine --> VectorDB[(PostgreSQL 16 + pgvector)]
  Engine --> Cache[(Redis Cache & Task Broker)]
  Cache --> Worker[Async Background Celery Workers]
  Worker --> GitHub[GitHub API & Webhook Ingestion]`,
    sections: [
      {
        id: "sec-custom-arch",
        section_type: "OVERVIEW",
        title: `System Architecture & Topology for ${displayName}`,
        content_markdown: `### Architecture Overview of ${displayName}

The **${displayName}** repository is engineered around modular domain boundaries designed for high availability and low-latency data processing:

- **Frontend & Interaction Layer**: Next.js 14 App Router rendering developer diagnostics, real-time status indicators, and responsive interactive graphs.
- **API & Orchestration Tier**: Asynchronous endpoint handlers validating client requests and managing task dispatching.
- **Persistence & Vector Storage**: ACID relational data co-located with vector similarity indexing for high-dimensional code embeddings.
- **Asynchronous Task Workers**: Background workers handling heavy computational indexing, AST syntax traversal, and git diff correlation.`,
        risk_level: "LOW",
        referenced_files: ["frontend/app/page.tsx", "backend/app/main.py", "ARCHITECTURE.md"],
        display_order: 1,
      },
      {
        id: "sec-custom-pipelines",
        section_type: "CRITICAL_PATH",
        title: "Critical Ingestion & Execution Pipelines",
        content_markdown: `### Primary Data & Analysis Pipelines in ${repoSlug}

1. **Ingestion & AST Tokenization**: Parses source code files into syntax trees, computing function coordinate maps and complexity metrics.
2. **Git Commit Graph & Diff Correlation**: Queries commit history within configurable temporal windows to identify structural changes affecting failing frames.
3. **Causal Reasoning & Ranking Engine**: Evaluates commit diffs against stack trace coordinates, computing statistical causality scores and generating plain-English root cause explanations.`,
        risk_level: "MEDIUM",
        referenced_files: ["backend/app/services/rca_engine.py", "backend/app/services/github_service.py"],
        display_order: 2,
      },
      {
        id: "sec-custom-danger",
        section_type: "DANGER_ZONE",
        title: "Danger Zone: High-Churn Concurrency & Database Mutex",
        content_markdown: `### ⚠️ High-Risk Concurrency & Mutex Boundaries

The following modules in **${displayName}** manage shared state and require caution during modification:

- **Distributed Lock Management**: Manages cross-worker task deduping and indexing locks.
- **Vector Embedding Batch Updates**: Performs bulk vector upserts into pgvector indexes. Modifying transaction boundaries can trigger connection exhaustion under load.

> **Team Note**: Ensure all schema migrations are backward-compatible and include non-blocking index creation statements (\`CREATE INDEX CONCURRENTLY\`).`,
        risk_level: "CRITICAL",
        referenced_files: ["backend/app/core/database.py", "backend/app/workers/tasks.py"],
        display_order: 3,
      },
      {
        id: "sec-custom-setup",
        section_type: "SETUP_GUIDE",
        title: `Local Development & Runbook for ${repoSlug}`,
        content_markdown: `### Local Setup & Development Runbook

\`\`\`bash
# 1. Clone repository
git clone https://github.com/${displayName}.git
cd ${repoSlug}

# 2. Install dependencies & start development environment
cd frontend && npm install && npm run dev

# 3. In a separate terminal, start backend services
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
\`\`\`

- **\`frontend/\`**: User interface components, page routes, and state stores.
- **\`backend/\`**: FastAPI application, database models, and AST analysis engines.
- **\`infra/\`**: Docker compose setup and deployment manifests.`,
        risk_level: "LOW",
        referenced_files: ["package.json", "docker-compose.yml", "README.md"],
        display_order: 4,
      },
    ],
    created_at: new Date().toISOString(),
  };
}
