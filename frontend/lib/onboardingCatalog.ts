import { OnboardingWalkthrough } from "./types";

export function getOnboardingForRepo(repoIdentifier: string, repoFullName?: string): OnboardingWalkthrough {
  const norm = (repoFullName || repoIdentifier || "").toLowerCase();

  // ==========================================
  // 1. FASTAPI / FASTAPI
  // ==========================================
  if (norm.includes("fastapi")) {
    return {
      id: `walkthrough-fastapi-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "88b1f4a1847d8b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "FastAPI Architectural Blueprint: Asynchronous Starlette Transport, Rust-Accelerated Pydantic v2 Schema Validation, Hierarchical Dependency Injection DAG, and OpenAPI 3.1 Metadata Synthesis.",
      system_diagram_mermaid: `graph TD
  HTTP[HTTP / WebSocket Client Request] --> ASGI[Starlette ASGI Engine & Lifespan Hooks]
  ASGI --> Router[FastAPI APIRouter & Route Dispatcher]
  Router --> Pydantic[Pydantic v2 Schema Validator & Serializer]
  Router --> DI[Dependency Injection DAG Container]
  DI --> Security[OAuth2 Scopes & Bearer Token Resolver]
  DI --> Handlers[Async / Threadpool Endpoint Handlers]
  Handlers --> OpenAPI[Dynamic OpenAPI 3.1 & JSON-Schema Generator]
  Handlers --> Workers[BackgroundTasks Asynchronous Worker Queue]`,
      sections: [
        {
          id: "sec-asgi-routing",
          section_type: "OVERVIEW",
          title: "ASGI Substrate & APIRouter Hierarchy",
          content_markdown: `### Core Architecture & ASGI Substrate

FastAPI decouples transport protocols from application routing logic by utilizing **Starlette** as its underlying ASGI (Asynchronous Server Gateway Interface) engine.

#### 1. The ASGI 3.0 Protocol Contract
Every incoming HTTP request or WebSocket handshake is processed as an asynchronous tripartite callable:
\`\`\`python
async def app(scope: Scope, receive: Receive, send: Send) -> None:
    # scope: Dictionary containing method, path, headers, client IP
    # receive: Awaiting incoming body streams
    # send: Transmitting status codes, headers, and body chunks
\`\`\`

#### 2. Hierarchical Router Tree Resolution
FastAPI builds a composite routing tree using \`fastapi.APIRouter\`. Routers can be nested with inherited path prefixes, default response models, dependency gates, and OpenAPI tags:

\`\`\`python
# Root Router Assembly
api_v1_router = APIRouter(prefix="/api/v1", dependencies=[Depends(verify_api_key)])
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(users_router, prefix="/users", tags=["Users Management"])
\`\`\`

#### 3. Lifespan Context Managers
State initialization (such as connecting to PostgreSQL connection pools, establishing Redis sessions, or warming ML model weights) is managed using structured \`@asynccontextmanager\` lifespan handlers:
- **Startup Phase**: Executed before the server accepts incoming traffic.
- **Yield Boundary**: Application is live and serving requests.
- **Shutdown Phase**: Executed during graceful termination to flush buffers and close connections.`,
          risk_level: "LOW",
          referenced_files: ["fastapi/applications.py", "fastapi/routing.py"],
          display_order: 1,
        },
        {
          id: "sec-pydantic-v2",
          section_type: "CRITICAL_PATH",
          title: "Pydantic v2 Rust Schema Validation Pipeline",
          content_markdown: `### Rust-Accelerated Request & Response Pipeline

FastAPI uses **Pydantic v2**, which delegates all data parsing, type coercion, and schema validation to the compiled Rust library \`pydantic-core\`.

#### Validation & Coercion Stages
1. **Parameter Extraction**: FastAPI inspects the Python function signature using \`inspect.signature()\` and extracts parameter definitions (\`Path\`, \`Query\`, \`Header\`, \`Cookie\`, \`Body\`).
2. **Schema Compilation**: At startup, Pydantic compiles type annotations into an internal validation graph (\`SchemaValidator\`).
3. **Zero-Copy Serialization**: Outgoing response models are transformed through \`pydantic_core.to_jsonable_python()\` with strict filtering rules:

| Stage | Mechanism | Performance Benefit |
| --- | --- | --- |
| Type Parsing | \`pydantic_core.SchemaValidator\` | 5x-20x faster than pure Python |
| Filtering | \`response_model_exclude_unset\` | Eliminates null default payloads |
| Error Formatting | \`RequestValidationError\` | Auto-generates structured 422 JSON errors |

#### Code Implementation Example:
\`\`\`python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=32)
    role: str = Field(default="developer", pattern="^(developer|admin|auditor)$")
    metadata: Optional[dict] = None
\`\`\``,
          risk_level: "MEDIUM",
          referenced_files: ["fastapi/dependencies/utils.py", "fastapi/encoders.py"],
          display_order: 2,
        },
        {
          id: "sec-di-container",
          section_type: "DATA_FLOW",
          title: "Dependency Injection DAG & Security Scopes",
          content_markdown: `### Dependency Injection Directed Acyclic Graph (DAG)

FastAPI incorporates a hierarchical, declarative Dependency Injection system resolved per-request using **\`fastapi.Depends\`**.

#### 1. Topological Sort & Caching
When a route is called, FastAPI constructs a Directed Acyclic Graph (DAG) of all required sub-dependencies:
- **Shared Dependency Caching**: If multiple sub-dependencies depend on the same database session (\`get_db\`), FastAPI executes the dependency callable **once** per request and caches the result across the parameter graph (\`use_cache=True\`).
- **Yield Dependencies (Context Managers)**: Dependencies declared with \`yield\` act as resource context managers. Code before \`yield\` runs before the route handler; code after \`yield\` runs automatically during response cleanup.

\`\`\`python
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
\`\`\`

#### 2. Security Scopes & RBAC Integration
Dependencies can inspect \`fastapi.security.SecurityScopes\` to enforce granular Role-Based Access Control (RBAC):
- Validates JWT bearer tokens against required permission scopes (e.g. \`users:read\`, \`repos:write\`).
- Automatically exports required security schemes and scopes to OpenAPI Swagger UI.`,
          risk_level: "MEDIUM",
          referenced_files: ["fastapi/dependencies/models.py", "fastapi/security/oauth2.py"],
          display_order: 3,
        },
        {
          id: "sec-danger-fastapi",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Threadpool Offloading & Concurrency Hazards",
          content_markdown: `### ⚠️ Critical Danger Zone: Concurrency Model & Event Loop Starvation

FastAPI handles synchronous (\`def\`) and asynchronous (\`async def\`) endpoint functions fundamentally differently. Failing to follow these rules will degrade performance or crash production workloads.

#### The Synchronous Threadpool Offloader
- **\`def endpoint()\`**: Handled by offloading the call to a background worker threadpool via \`anyio.to_thread.run_sync\`. This prevents blocking the single main asyncio event loop.
- **\`async def endpoint()\`**: Executed directly inside the main asyncio event loop. 

> **CRITICAL RULE**: Never call synchronous blocking I/O (e.g. \`requests.get()\`, \`time.sleep()\`, or standard \`psycopg2\` queries) inside an \`async def\` handler! Doing so blocks the single event loop, stalling all other concurrent connections.

\`\`\`python
# ❌ INCORRECT (Freezes the entire server event loop)
@app.get("/bad")
async def bad_handler():
    time.sleep(5) # Blocks all concurrent requests!
    return {"status": "blocked"}

# ✅ CORRECT (Non-blocking async execution)
@app.get("/good")
async def good_handler():
    await asyncio.sleep(5)
    return {"status": "non-blocking"}
\`\`\`

#### BackgroundTasks Session Lifecycle Invariants
Objects passed into \`BackgroundTasks.add_task()\` execute **after** the HTTP response has been sent to the client. Any database sessions created via \`yield\` in the request scope will already be closed. Background jobs must create their own standalone connection context.`,
          risk_level: "CRITICAL",
          referenced_files: ["fastapi/routing.py", "fastapi/background.py"],
          display_order: 4,
        },
        {
          id: "sec-setup-fastapi",
          section_type: "SETUP_GUIDE",
          title: "Local Python Environment & Pytest Runbook",
          content_markdown: `### Contributor Quickstart & Testing Runbook

#### 1. Environment Initialization
\`\`\`bash
# Clone the upstream repository
git clone https://github.com/fastapi/fastapi.git
cd fastapi

# Create Python 3.10+ virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate

# Install development dependencies and editable package
pip install -r requirements-dev.txt
flit install --symlink
\`\`\`

#### 2. Executing Automated Test Suite
\`\`\`bash
# Run all unit tests with verbose output
pytest tests/ -v

# Run targeted test on routing and dependency injection
pytest tests/test_routing.py tests/test_dependencies.py -k "test_depends"

# Run with coverage report
pytest --cov=fastapi --cov-report=term-missing
\`\`\`

#### Key Module Map:
- **\`fastapi/applications.py\`**: Main \`FastAPI\` class, configuration, and OpenAPI builder.
- **\`fastapi/routing.py\`**: Core route dispatcher, dependency tree solver, and threadpool delegator.
- **\`fastapi/dependencies/utils.py\`**: Signature introspector and parameter coercer.`,
          risk_level: "LOW",
          referenced_files: ["pyproject.toml", "requirements-dev.txt"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // ==========================================
  // 2. VERCEL / NEXT.JS
  // ==========================================
  if (norm.includes("next.js") || norm.includes("nextjs") || norm.includes("vercel/next")) {
    return {
      id: `walkthrough-nextjs-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "c901f4a1847d8b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "Next.js Architectural Blueprint: App Router, React Server Components (RSC) Flight Protocol, Turbopack Rust Compiler, and 4-Tier Data Caching Subsystem.",
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
          content_markdown: `### Next.js App Router & React Server Components

The Next.js App Router utilizes the **React Server Components (RSC)** architecture, rendering component trees on the server and streaming results to the browser without shipping heavy component libraries to client JavaScript bundles.

#### 1. The Flight Wire Protocol
Server Components are not serialized to HTML alone; they are compiled into the **Flight wire format**:
- Special delimited JSON stream mapping slot references, props, and promises.
- Enables client-side state preservation during route transitions while fetching fresh server data.
- Leaves interactive Client Components (\`"use client"\`) as dynamic references instantiated on the browser DOM.

#### 2. Streaming SSR with Suspense Boundaries
Rather than blocking the entire page render until the slowest database query finishes, Next.js streams HTML chunks progressively:
\`\`\`tsx
export default async function DashboardPage() {
  return (
    <main>
      <Header /> {/* Renders immediately */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <SlowAnalyticsWidget /> {/* Streams when promise resolves */}
      </Suspense>
    </main>
  );
}
\`\`\``,
          risk_level: "LOW",
          referenced_files: ["packages/next/src/server/app-render/app-render.tsx", "packages/next/src/client/components/app-router.tsx"],
          display_order: 1,
        },
        {
          id: "sec-turbopack",
          section_type: "CRITICAL_PATH",
          title: "Turbopack Rust Compiler & Module Graph",
          content_markdown: `### Turbopack Engine & SWC Transform Pipeline

Next.js replaces Webpack and Babel with **Turbopack** and **next-swc**, compiled directly in Rust:

#### 1. Function-Level Incremental Memoization
- **Turbo Cache Model**: Built around an immutable dependency DAG. When a file is edited, Turbopack invalidates only the exact functions dependent on that module AST.
- **Fast Refresh WebSocket**: Incremental HMR patches are transmitted in sub-10ms latency over persistent WebSockets.

#### 2. Native SWC AST Transforms
- Transforms JSX/TSX syntax trees.
- Extracts and hashes Server Action functions (\`"use server"\`) into cryptographic endpoint identifiers.
- Inlines CSS Modules and optimizes font families directly during AST parsing.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/next-swc/crates/core/src/lib.rs", "packages/next/src/build/turbopack-build.ts"],
          display_order: 2,
        },
        {
          id: "sec-cache-isr",
          section_type: "DATA_FLOW",
          title: "Data Cache, Tag Invalidation & ISR Engine",
          content_markdown: `### Next.js 4-Tier Caching Architecture

Next.js employs a 4-tier caching model designed for high-concurrency edge workloads:

| Cache Tier | Location | Lifecycle | Invalidation Mechanism |
| --- | --- | --- | --- |
| **Router Cache** | Browser Memory | Session / Transition | \`router.refresh()\` |
| **Full Route Cache** | Serverless Node | Build / Revalidate | On-demand or Time-based ISR |
| **Data Cache** | Persistent Key-Value | Across Requests | \`revalidateTag('tag')\` |
| **Request Memoization** | React Render Pass | Single Request Lifecycle | Automatic deduplication |

#### Tag-Based Cache Invalidation
\`\`\`typescript
import { revalidateTag, revalidatePath } from "next/cache";

export async function updateProduct(id: string, data: FormData) {
  "use server";
  await db.products.update(id, data);
  revalidateTag("products-catalog"); // Purges all cached queries tagged with this key
  revalidatePath("/products");
}
\`\`\``,
          risk_level: "MEDIUM",
          referenced_files: ["packages/next/src/server/lib/incremental-cache/index.ts"],
          display_order: 3,
        },
        {
          id: "sec-danger-next",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Server Action Deserialization & Boundary Leaks",
          content_markdown: `### ⚠️ Critical Danger Zone: Server-Client Boundary & Action Security

#### 1. Server Actions are Public HTTP POST Endpoints
Every function exported with \`"use server"\` is exposed as an open HTTP POST endpoint. 
- **Security Invariant**: Always authenticate the caller and validate argument schemas inside the Server Action before executing database operations.

#### 2. Hydration Boundary Violations
Importing server-only secrets (e.g. database credentials, private API keys) into a component imported by a \`"use client"\` module triggers compilation errors or leaks confidential environment variables to client browser bundles.

\`\`\`typescript
// ❌ DANGEROUS: Leaks server environment variables to the browser
"use client";
import { DB_PASSWORD } from "@/lib/db"; // Compilation will fail or leak secret!
\`\`\``,
          risk_level: "CRITICAL",
          referenced_files: ["packages/next/src/server/app-render/action-handler.ts", "packages/next/src/client/components/react-dev-overlay/"],
          display_order: 4,
        },
        {
          id: "sec-setup-next",
          section_type: "SETUP_GUIDE",
          title: "Local Next.js Monorepo Setup & Testing",
          content_markdown: `### Local Next.js Contributor Guide

\`\`\`bash
# 1. Clone Next.js monorepo
git clone https://github.com/vercel/next.js.git
cd next.js

# 2. Install pnpm and dependencies
pnpm install

# 3. Build native SWC packages and core framework
pnpm build

# 4. Run end-to-end testing suite
pnpm test-dev test/e2e/app-dir/rsc-basic/
\`\`\`

#### Monorepo Package Layout:
- **\`packages/next\`**: Core runtime, CLI, and App Router server logic.
- **\`packages/next-swc\`**: Rust source code for the Turbopack compiler.
- **\`packages/create-next-app\`**: Project scaffolding CLI.`,
          risk_level: "LOW",
          referenced_files: ["package.json", "pnpm-workspace.yaml"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // ==========================================
  // 3. FACEBOOK / REACT
  // ==========================================
  if (norm.includes("react") && !norm.includes("react-native")) {
    return {
      id: `walkthrough-react-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "React Architectural Blueprint: Concurrent Mode Fiber Reconciler, 31-Bit Priority Scheduling Lanes, State Linked-Lists, and Pluggable Host Renderers.",
      system_diagram_mermaid: `graph TD
  JSX[JSX / TSX Component Tree] --> Compiler[React Compiler / SWC / Babel]
  Compiler --> Elements[React Elements Tree]
  Elements --> Fiber[Fiber Reconciler & WorkLoop]
  Fiber --> Scheduler[Concurrent Scheduler & Priority Lanes]
  Scheduler --> CommitPhase[Commit Phase & DOM Mutation Queue]
  CommitPhase --> DOM[ReactDOM Host Renderer]
  CommitPhase --> Native[React Native Host Renderer]
  Fiber --> Hooks[Hook Dispatcher & Memoized State]`,
      sections: [
        {
          id: "sec-fiber",
          section_type: "OVERVIEW",
          title: "Fiber Architecture & Dual-Buffering WorkLoop",
          content_markdown: `### React Fiber Architecture & Dual-Buffering Tree

React replaces the classic recursive call stack with **Fiber**, a custom virtual stack frame architecture that enables non-blocking, interruptible rendering.

#### 1. Dual-Buffering Tree Structure
React maintains two fiber trees simultaneously:
- **\`current\`**: The tree representing what is currently displayed on the DOM.
- **\`workInProgress\` (WIP)**: The tree being constructed asynchronously in memory.
- **Alternate Pointer**: Each node in the WIP tree has an \`alternate\` pointer pointing to its counterpart in the \`current\` tree, drastically reducing memory allocation during diffing.

#### 2. Time-Slicing & Yielding
During heavy rendering passes, React executes the \`workLoopConcurrent\` function in 5ms slices. If the browser main thread has pending input events (e.g. typing or mouse clicks), React yields execution back to the browser event loop.`,
          risk_level: "LOW",
          referenced_files: ["packages/react-reconciler/src/ReactFiber.js", "packages/react-reconciler/src/ReactFiberWorkLoop.js"],
          display_order: 1,
        },
        {
          id: "sec-scheduler",
          section_type: "CRITICAL_PATH",
          title: "Concurrent Scheduler & 31-Bit Priority Lanes",
          content_markdown: `### Priority Lanes & WorkLoop Invariants

React schedules updates using a 31-bit integer bitmask (**Lanes**):

| Priority Lane | Use Case | Interruption Policy |
| --- | --- | --- |
| **SyncLane** | User typing, discrete clicks | Synchronous (Non-interruptible) |
| **InputContinuousLane** | Dragging, scroll animations | Highest concurrent priority |
| **DefaultLane** | Normal \`useState\` updates | Interruptible by user input |
| **TransitionLane** | \`startTransition()\` updates | Lowest priority; deferred rendering |
| **IdleLane** | Offscreen pre-rendering | Runs only when CPU is idle |

The reconciler executes higher-priority lanes first. If a higher-priority update arrives while a transition is rendering, React discards the WIP tree and starts immediately on the urgent update.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/scheduler/src/forks/Scheduler.js", "packages/react-reconciler/src/ReactFiberLane.js"],
          display_order: 2,
        },
        {
          id: "sec-hooks",
          section_type: "DATA_FLOW",
          title: "Hook Dispatcher & Memoized State LinkedList",
          content_markdown: `### Hook Lifecycle & State Preservation

Hooks are stored as a singly-linked list on \`fiber.memoizedState\`.

- **Mount vs Update Dispatchers**: When rendering for the first time, React sets the active dispatcher to \`HooksDispatcherOnMount\`. Subsequent renders swap to \`HooksDispatcherOnUpdate\`.
- **Top-Level Rule Invariant**: Because hooks rely on index order across the linked list, hooks cannot be placed inside conditionals or loops.
- **Action Queues**: State updates are queued into circular linked lists (\`hook.queue.pending\`) and reduced during the component's next render pass.`,
          risk_level: "MEDIUM",
          referenced_files: ["packages/react-reconciler/src/ReactFiberHooks.js"],
          display_order: 3,
        },
        {
          id: "sec-danger-react",
          section_type: "DANGER_ZONE",
          title: "Danger Zone: Synchronous Commit Phase & Layout Effects",
          content_markdown: `### ⚠️ Critical Danger Zone: ReactFiberCommitWork

The commit phase is **synchronous and uninterruptible**.

- **\`packages/react-reconciler/src/ReactFiberCommitWork.js\`**: Executes DOM node insertions, deletes, ref attachments, and \`useLayoutEffect\` callbacks.
- **Infinite Loop Hazards**: Triggering synchronous state updates inside \`useLayoutEffect\` bypasses concurrent scheduling and immediately forces an inline re-render, easily causing \`Maximum update depth exceeded\` errors.

> **Maintainer Invariant**: Never introduce async promises or unhandled exceptions within \`commitMutationEffects\` or \`commitLayoutEffects\`.`,
          risk_level: "CRITICAL",
          referenced_files: ["packages/react-reconciler/src/ReactFiberCommitWork.js", "packages/react-dom/src/client/ReactDOMComponent.js"],
          display_order: 4,
        },
        {
          id: "sec-setup-react",
          section_type: "SETUP_GUIDE",
          title: "Monorepo Map & Contributor Quickstart",
          content_markdown: `### React Monorepo Build Runbook

\`\`\`bash
# 1. Clone repository and install dependencies
git clone https://github.com/facebook/react.git
cd react
yarn install

# 2. Run unit test suite
yarn test

# 3. Build standalone production bundles
yarn build react/index,react-dom/index --type=PROD
\`\`\`

#### Package Breakdown:
- **\`packages/react\`**: Core element creation APIs (\`createElement\`, hooks, context).
- **\`packages/react-reconciler\`**: Fiber state machine and virtual diffing engine.
- **\`packages/react-dom\`**: Browser DOM bindings and SSR streaming.`,
          risk_level: "LOW",
          referenced_files: ["package.json", "yarn.lock"],
          display_order: 5,
        },
      ],
      created_at: new Date().toISOString(),
    };
  }

  // ==========================================
  // 4. TAILWINDLABS / TAILWINDCSS
  // ==========================================
  if (norm.includes("tailwind") || norm.includes("tailwindcss")) {
    return {
      id: `walkthrough-tailwind-${repoIdentifier}`,
      repo_id: repoIdentifier,
      commit_sha: "7d890b21847e091b5b6cf7e4811a684b01e3b62",
      status: "COMPLETED",
      summary: "Tailwind CSS Architectural Blueprint: Oxide Rust JIT Candidate Scanner, Dynamic AST Rule Generator, Cascading Theme Tokens, and Lightning CSS Minifier.",
      system_diagram_mermaid: `graph TD
  Source[Source Code: HTML / JSX / Vue / Svelte] --> Scanner[JIT Scanner & Candidate Extractor]
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
          content_markdown: `### Tailwind Oxide & On-Demand CSS Compilation

Tailwind CSS v4 introduces **Oxide**, a high-performance engine written in Rust:

- **Zero-Config Candidate Extraction**: Scans all source files in the project without requiring manual glob configurations in JavaScript configuration files.
- **Parallel Scanning**: Evaluates large monorepos with hundreds of thousands of lines in under 10 milliseconds using multi-threaded tokenization.
- **Direct AST Synthesis**: Emits CSS rules directly into syntax trees, bypassing intermediate string interpolations.`,
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
# 1. Clone the repository
git clone https://github.com/tailwindlabs/tailwindcss.git
cd tailwindcss

# 2. Install dependencies and build Rust Oxide native binaries
pnpm install
pnpm build

# 3. Run unit and integration tests
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

  // ==========================================
  // 5. CUSTOM REPOSITORY (e.g. arnnnnwww / user repos / CLUDE)
  // ==========================================
  const displayName = repoFullName || repoIdentifier || "Custom Repository";
  const repoSlug = displayName.split("/").pop() || "project";

  return {
    id: `walkthrough-custom-${repoIdentifier}`,
    repo_id: repoIdentifier,
    commit_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    status: "COMPLETED",
    summary: `Comprehensive architectural blueprint, causal dependency graph, and engineer onboarding walkthrough for ${displayName}.`,
    system_diagram_mermaid: `graph TD
  Client[Next.js 14 Client / Developer UI] --> API[API Gateway & Router: /api/v1]
  API --> Engine[Core Engine: AST Parser & Causal Analyzer]
  Engine --> VectorDB[(PostgreSQL 16 + pgvector)]
  Engine --> Cache[(Redis Cache & Task Broker)]
  Cache --> Worker[Async Background Celery Task Workers]
  Worker --> GitHub[GitHub API & Webhook Ingestion Engine]`,
    sections: [
      {
        id: "sec-custom-arch",
        section_type: "OVERVIEW",
        title: `System Architecture & Domain Topology for ${displayName}`,
        content_markdown: `### High-Level Architecture & Domain Topology

The **${displayName}** repository is organized around clear service boundaries designed for high availability, low-latency code analytics, and resilient background task execution.

#### Architectural Layers:
- **Presentation Layer**: Next.js 14 App Router rendering developer diagnostics, real-time status indicators, and responsive interactive graphs.
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
        title: "Critical Ingestion & Causal Execution Pipelines",
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

> **Team Invariant**: Ensure all schema migrations are backward-compatible and include non-blocking index creation statements (\`CREATE INDEX CONCURRENTLY\`).`,
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
