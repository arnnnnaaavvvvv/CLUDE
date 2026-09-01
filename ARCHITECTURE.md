# CLUDE — Architecture Specification

> **Autonomous Production Incident Root-Cause Engine & Codebase Intelligence Platform**
> 
> *A deterministic, semantic causal reasoning engine that pinpoints breaking commits from runtime stack traces in $< 8\text{s}$ and synthesizes codebase onboarding walkthroughs via AST-grounded vector topology.*

---

## 1. Executive System Overview

Modern incident triage relies heavily on manual heuristics (`git log`, `git bisect`, and `git blame`), which only indicate who last touched a line—not whether that modification introduced the breaking state mutation. 

**CLUDE** replaces manual bisection with **Semantic Causal Reasoning**. When a production incident occurs, CLUDE ingests raw multi-language stack traces, extracts deterministic frame coordinates, correlates them across temporal git commit graphs, retrieves relevant AST diff hunks using vector similarity ($1536$-dim HNSW indexing in PostgreSQL `pgvector`), and feeds a constrained context window into an LLM reasoning engine (Claude 3.5 Sonnet / GPT-4o) to output ranked candidate commits with step-by-step reproduction hypotheses and code remediation diffs.

```mermaid
flowchart TD
    subgraph ClientLayer["1. Client Layer (Next.js 14 + Tailwind)"]
        UI["Incident Dashboard / Monaco Diff Viewer"]
        OnboardingUI["Codebase Topology & Walkthrough Explorer"]
    end

    subgraph APILayer["2. API & Ingestion Layer (FastAPI)"]
        Router["FastAPI Async Gateway"]
        TraceParser["Deterministic Stack Trace Parser (Python/TS/Go/Java/Rust)"]
        Webhook["GitHub Webhook Ingestion"]
    end

    subgraph AsyncWorkerLayer["3. Async Worker Engine (Celery + Redis)"]
        WorkerQueue["Redis Task Queue"]
        CeleryWorkers["Celery Async Workers"]
        ASTJob["Tree-sitter AST Chunking & Hashing"]
    end

    subgraph CoreEngines["4. Core Analysis Engines"]
        RCAEngine["RCA Causal Reasoning Engine"]
        OnboardingEngine["Onboarding & Churn Analysis Engine"]
        EmbeddingSvc["OpenAI text-embedding-3-small (1536d)"]
    end

    subgraph StorageLayer["5. Persistence & Vector Layer"]
        PG[("PostgreSQL 16 + pgvector")]
        HNSW["HNSW Vector Index (Chunks & Diffs)"]
        Relational["Relational Tables (Commits, Traces, Runs)"]
    end

    subgraph ExternalServices["6. External Integrations"]
        LLM["Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o"]
        GitHubAPI["GitHub REST & GraphQL API"]
    end

    UI --> Router
    OnboardingUI --> Router
    Router --> TraceParser
    Router --> Webhook
    Webhook --> WorkerQueue
    WorkerQueue --> CeleryWorkers
    CeleryWorkers --> ASTJob
    ASTJob --> EmbeddingSvc
    EmbeddingSvc --> HNSW

    Router --> RCAEngine
    RCAEngine --> HNSW
    RCAEngine --> Relational
    RCAEngine --> GitHubAPI
    RCAEngine --> LLM
    RCAEngine --> PG

    Router --> OnboardingEngine
    OnboardingEngine --> Relational
    OnboardingEngine --> HNSW
    OnboardingEngine --> LLM
```

---

## 2. System Architecture & Component Breakdown

### 2.1 Multi-Language Stack Trace Parser
Located at `backend/app/services/stack_trace_parser.py`:
- Deterministically parses call frames across **Python**, **TypeScript/JavaScript** (V8 & WebKit engines), **Go panics**, **Java**, and **Rust**.
- Normalizes disparate path conventions (e.g., `src/services/payment.ts:142:28` vs `services/payment.py, line 45`) into uniform `ParsedStackFrame` schemas.
- Filters out non-application frames (standard libraries, `node_modules`, `venv/`, third-party packages) to concentrate token budgets exclusively on user repository code.

### 2.2 AST Indexing & Structural Chunking Subsystem
Located at `backend/app/services/ast_parser.py`:
- Utilizes **Tree-sitter** grammar parsers to extract semantic language constructs (functions, methods, classes, and interface declarations).
- Computes cryptographic SHA-256 content hashes for every AST chunk to ensure **incremental re-indexing**—skipping unchanged nodes during push webhook delta processing.
- Generates 1536-dimensional vector embeddings via `text-embedding-3-small` and indexes them into PostgreSQL using HNSW cosine distance indexing (`vector_cosine_ops`).

```mermaid
sequenceDiagram
    autonumber
    participant GitHub as GitHub Webhooks
    participant API as FastAPI Webhook Handler
    participant Worker as Celery Worker
    participant TreeSitter as Tree-sitter AST Engine
    participant PG as PostgreSQL + pgvector

    GitHub->>API: Push Event (Commit SHA delta)
    API->>Worker: Dispatch AST Indexing Job
    Worker->>TreeSitter: Parse changed source files
    TreeSitter->>TreeSitter: Extract functions, classes, interfaces
    TreeSitter->>TreeSitter: Compute SHA-256 chunk hashes
    Worker->>PG: Upsert Chunks & 1536d Embeddings (pgvector)
    Worker-->>API: Delta Indexing Completed (< 3s)
```

---

## 3. RCA Causal Reasoning Engine

Located at `backend/app/services/rca_engine.py`:

### 3.1 Two-Stage Candidate Retrieval
1. **Direct Coordinate Matching**: Correlates file coordinates and function symbols from top stack frames against repository commits within a configurable temporal window ($\Delta t \le 14\text{ days}$).
2. **Semantic Vector Fallback**: For dynamic invocations or indirect failures where file names differ, executes cosine similarity retrieval against diff hunk embeddings in `pgvector`.

### 3.2 Causal Evaluation & Scoring Formula
Candidate diffs and stack traces are synthesized into an LLM prompt demanding structured JSON output. The calibrated confidence score $C \in [0.00, 1.00]$ is computed based on:

$$C = w_1 \cdot S_{\text{frame\_match}} + w_2 \cdot S_{\text{diff\_overlap}} + w_3 \cdot S_{\text{causal\_plausibility}}$$

- **High Likelihood ($C \ge 0.80$):** Direct structural change in failing code path with explicit failure mechanics.
- **Plausible ($0.50 \le C < 0.80$):** Upstream interface change, signature drift, or configuration modification that indirectly triggers downstream failure.
- **Low Likelihood ($C < 0.50$):** Unrelated refactor in adjacent module.

---

## 4. Onboarding & Codebase Topology Engine

Located at `backend/app/services/onboarding_engine.py`:
1. **System Topology Synthesis**: Analyzes module dependencies and entry points to generate dark-mode **Mermaid.js** architectural diagrams.
2. **Danger Zone & Churn Detection**: Computes commit frequency and entropy metrics to identify files in the $\ge 90\text{th}$ percentile of churn with elevated risk profiles.
3. **Execution Call Paths**: Synthesizes end-to-end execution flows across key platform lifecycle events (request handling, async worker dispatch, and state hydration).

---

## 5. Data Models & Database Schema

```mermaid
erDiagram
    REPOSITORIES ||--o{ COMMITS : contains
    REPOSITORIES ||--o{ CODE_CHUNKS : indexes
    REPOSITORIES ||--o{ STACK_TRACES : receives
    COMMITS ||--o{ DIFFS : contains
    STACK_TRACES ||--o{ ANALYSIS_RUNS : evaluates
    ANALYSIS_RUNS ||--o{ RANKED_CANDIDATES : outputs

    REPOSITORIES {
        uuid id PK
        string full_name
        string default_branch
        datetime last_indexed_at
    }

    COMMITS {
        uuid id PK
        uuid repo_id FK
        string sha
        string author_name
        string message
        datetime committed_at
    }

    DIFFS {
        uuid id PK
        uuid commit_id FK
        string file_path
        string status
        int additions
        int deletions
        text patch
    }

    CODE_CHUNKS {
        uuid id PK
        uuid repo_id FK
        string file_path
        string chunk_type
        string symbol_name
        string content_hash
        vector embedding_1536
    }

    STACK_TRACES {
        uuid id PK
        uuid repo_id FK
        text raw_trace
        string error_type
        string error_message
    }

    ANALYSIS_RUNS {
        uuid id PK
        uuid trace_id FK
        string status
        string model_used
        float execution_duration_sec
    }

    RANKED_CANDIDATES {
        uuid id PK
        uuid run_id FK
        uuid commit_id FK
        int rank
        float confidence_score
        text explanation
        text reproduction_steps
        text suggested_fix
    }
```

---

## 6. Frontend Architecture (Next.js 14 + Monaco)

- **Next.js 14 App Router**: Server and client component separation with dynamic streaming.
- **Monaco Diff Viewer**: Embedded side-by-side syntax-highlighted diff viewer highlighting exact hunk modifications with line anchors.
- **Tailwind CSS & Framer Motion**: Clean dark-mode engineering aesthetic with sub-100ms micro-interactions.
- **Mermaid.js Integration**: Client-side reactive rendering of architectural graphs and call-trace sequence diagrams.

---

## 7. Infrastructure, Concurrency & Security

- **Containerization**: Multi-container Docker Compose setup (`backend`, `celery_worker`, `redis`, `postgres_pgvector`, `frontend`).
- **Async Concurrency**: Non-blocking Celery worker pool running on Redis broker with async SQLAlchemy (`asyncpg`) database driver.
- **Rate Limiting & Token Budgeting**: File exclusion filters (ignoring binaries, lockfiles, SVG, `.min.js`) ensure strict LLM context token optimization ($< 8000$ tokens per evaluation).
- **Security & Permissions**: Read-only GitHub OAuth token scopes with encrypted environment credential handling.
