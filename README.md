# CLUDE

> **Pinpoint the exact commit that broke production with causal AI reasoning, and onboard engineers to unfamiliar codebases in minutes.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://github.com/your-org/clude)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/clude/actions)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-336791.svg?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)

---

## Overview

**CLUDE** eliminates two of the costliest engineering time-sinks: (1) manually bisecting git history during high-severity production incidents to identify the commit that introduced an error, and (2) spending weeks navigating unfamiliar architectural topologies during developer onboarding. Instead of relying on naive string searches or line-ownership heuristics like `git blame`, CLUDE models **semantic causality**—evaluating how structural diffs across recent commits plausibly induced the exact failure pattern in a stack trace. Built on a shared AST parsing, vector indexing, and LLM orchestration substrate, CLUDE powers both precision root-cause diagnostics and repo-grounded onboarding walkthroughs within a single platform.

---

## Feature Matrix

| Feature | Description |
| :--- | :--- |
| **Multi-Language Stack Trace Parsing** | Deterministically parses file coordinates, line numbers, column offsets, and function symbols across Python, TypeScript/JavaScript (V8 & WebKit), Go panics, Java, and Rust. |
| **Git History Correlation** | Traverses commit history within a temporal window, correlating failing call frames against modified files and hunks via the GitHub GraphQL/REST APIs. |
| **LLM Causal Reasoning Engine** | Evaluates candidate diffs using Claude 3.5 Sonnet / GPT-4o to construct explainable causal chains rather than simple string or line matches. |
| **Calibrated Confidence Scoring** | Generates a normalized causal score ($0.00 - 1.00$) for each candidate commit, categorizing matches into High Likelihood ($\ge 0.80$), Plausible ($0.50 - 0.79$), or Low Likelihood ($< 0.50$). |
| **Ranked Root-Cause Reports** | Delivers plain-English explanations of failure mechanisms, step-by-step reproduction hypotheses, and actionable code remediation diffs. |
| **Repo-Wide AST Indexing** | Uses syntax-aware chunking (Tree-sitter) to index classes, functions, and interfaces into PostgreSQL with `pgvector` HNSW acceleration. |
| **Onboarding Walkthrough Generation** | Synthesizes an architecture guide directly from the codebase, producing system topology overviews, execution call paths, and Mermaid.js diagrams. |
| **Danger-Zone & Risk Detection** | Identifies fragile, high-churn modules with dense dependencies and elevated change frequency to warn engineers before making modifications. |
| **Interactive Diff Viewer** | Monaco-style syntax-highlighted diff viewer embedded directly into candidate commit reports with line anchors and addition/deletion tracking. |
| **Incremental Re-Indexing** | GitHub webhook listener processes push event deltas, hashing AST chunk content (SHA-256) to skip unchanged code and minimize embedding costs. |

---

## What It Can Do Now

- Ingest raw multiline stack traces or JSON payloads from Python, Node.js, Go, Java, and Rust.
- Connect public and private GitHub repositories over OAuth with read-only repository permissions.
- Index git commit trees, extract per-file diff hunks, and generate 1536-dimensional semantic embeddings.
- Filter out non-code assets (lockfiles, minified bundles, images) to maintain compact LLM token budgets.
- Evaluate candidate commits against stack frames to generate structured JSON causal ranking reports in under 8 seconds.
- Compute repository churn metrics and flag files in the 90th percentile of change frequency as high-risk danger zones.
- Render interactive, dark-mode Mermaid.js architectural topology diagrams from repository source analysis.
- Receive GitHub `push` webhooks to execute incremental delta re-indexing without full-tree recalculation.

---

## The Problem

| Dimension | `git blame` / Manual Search | Generic AI Chat (ChatGPT / Copilot) | **CLUDE** |
| :--- | :--- | :--- | :--- |
| **Reasoning Depth** | None. Shows who last touched a line, regardless of whether that change caused the bug. | High general reasoning, but lacks git context and diff history. | **Deep semantic causality.** Analyzes how a diff altered execution state to trigger the reported error. |
| **Incidence to Root Cause** | 30–90 minutes of manual `git log`, `git bisect`, and PR hunting. | 15–30 minutes copying code snippets and diffs into chat windows. | **< 10 seconds.** Paste trace $\to$ receive ranked commits with reasoning. |
| **Repo Awareness** | Limited to single-file line annotations. | Zero repo-level topology awareness unless pasted manually into context. | **Full graph context.** Indexes entire commit history, AST chunk embeddings, and file churn. |
| **Confidence Signal** | Binary (author of line). | Hallucinated confidence without verifying actual repository diffs. | **Calibrated scoring ($0.0 - 1.0$)** backed by matched hunks and frame coordinates. |
| **Onboarding Support** | None. Requires reading raw code and internal wikis. | Generic architectural summaries without repo churn or danger-zone grounding. | **Repo-grounded walkthroughs** with risk matrices, critical paths, and Mermaid graphs. |

---

## Get Started

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- PostgreSQL 16 with `pgvector` extension
- Redis 7+

### 1. Clone & Configure Backend
```bash
git clone https://github.com/your-org/clude.git
cd clude/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

### 2. Configure Frontend
```bash
cd ../frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```

The frontend will be live at `http://localhost:3000`.

---

## Docker Quick Start

Launch the entire stack (PostgreSQL + pgvector, Redis, FastAPI Backend, Celery Worker, Next.js Frontend) with a single command:

```bash
cd clude/infra
docker compose up --build
```

### Health Check
Verify all services are operational:
```bash
curl -f http://localhost:8000/health
# Response: {"status":"healthy","service":"clude-backend","timestamp":1725102300}
```

---

## Example Input & Output

### 1. AI Root-Cause Analysis

#### Input (Stack Trace)
```text
TypeError: Cannot read properties of undefined (reading 'calculateTax')
    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)
    at CheckoutController.handleCheckout (src/controllers/checkout.ts:89:12)
```

#### Output (Ranked Causal Report)
```json
{
  "analysis_run_id": "4a72d3e1-88fc-42fa-9a4f-56bbcc381a11",
  "status": "COMPLETED",
  "execution_duration_sec": 4.28,
  "error_summary": {
    "type": "TypeError",
    "message": "Cannot read properties of undefined (reading 'calculateTax')",
    "primary_frame": {
      "file_path": "src/services/payment.ts",
      "line_number": 142,
      "symbol": "PaymentProcessor.processOrder"
    }
  },
  "ranked_candidates": [
    {
      "rank": 1,
      "causal_score": 0.94,
      "commit": {
        "sha": "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
        "author": "alex@company.com",
        "committed_at": "2026-08-30T18:22:10Z",
        "message": "refactor(tax): extract tax calculation logic into dynamic provider"
      },
      "plain_english_reasoning": "Commit a1f4c39 modified src/services/payment.ts by making TaxEngineProvider instantiation asynchronous without awaiting its initialization in processOrder. This leaves this.taxProvider undefined when calculateTax is called at line 142 during standard checkout.",
      "reproduction_hypothesis": "Trigger checkout when payment type is 'CREDIT_CARD' and tax region is unset, bypassing synchronous fallback initialization.",
      "suggested_fix": "Add an explicit initialization check: await this.ensureTaxProviderInitialized() before calling this.taxProvider.calculateTax(order) at line 140.",
      "matched_files": ["src/services/payment.ts", "src/providers/tax.ts"]
    }
  ]
}
```

---

### 2. AI Codebase Onboarding

#### Output (Walkthrough Section)
```json
{
  "walkthrough_id": "b1820120-d3a9-4672-a1f9-8669c2789182",
  "repo_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "system_diagram_mermaid": "graph TD\n  Client --> API[API Gateway]\n  API --> PaymentSvc[Payment Service]\n  PaymentSvc --> DB[(PostgreSQL)]\n  PaymentSvc --> Stripe[Stripe Gateway]",
  "sections": [
    {
      "section_type": "DANGER_ZONE",
      "title": "Stateful Payment Concurrency & Distributed Locks",
      "risk_level": "CRITICAL",
      "content_markdown": "### ⚠️ Caution: Redis Distributed Mutex\nThe files under `src/core/locking/` manage stateful execution locks for idempotent billing. **Do not alter** the retry interval or acquisition TTL without executing the distributed chaos test suite.",
      "referenced_files": [
        { "file_path": "src/core/locking/redis_mutex.ts", "lines": "45-120" }
      ],
      "display_order": 1
    }
  ]
}
```

---

## API Usage

### 1. Submit Stack Trace for Root-Cause Analysis
```bash
curl -X POST http://localhost:8000/api/v1/rca/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "repo_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "raw_trace": "TypeError: Cannot read properties of undefined (reading '\''calculateTax'\'')\n    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)",
    "environment": "production",
    "time_window_days": 14
  }'
```

### 2. Retrieve Analysis Run
```bash
curl -X GET http://localhost:8000/api/v1/rca/runs/4a72d3e1-88fc-42fa-9a4f-56bbcc381a11
```

### 3. Trigger Onboarding Walkthrough Generation
```bash
curl -X POST http://localhost:8000/api/v1/onboarding/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/generate \
  -H "Content-Type: application/json" \
  -d '{"force_regenerate": true}'
```

### 4. Retrieve Onboarding Walkthrough
```bash
curl -X GET http://localhost:8000/api/v1/onboarding/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
```

---

## Configuration Reference

All environment variables can be set via environment flags or a `.env` file in `backend/`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql+asyncpg://clude_user:clude_password@localhost:5432/clude_db` | Async connection string for PostgreSQL with `pgvector`. |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis instance for rate limiting and API response caching. |
| `CELERY_BROKER_URL` | `redis://localhost:6379/1` | Redis task queue broker URL. |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Redis task results backend. |
| `PRIMARY_LLM_PROVIDER` | `anthropic` | Primary LLM provider (`anthropic` or `openai`). |
| `ANTHROPIC_API_KEY` | `None` | API key for Anthropic Claude models. |
| `OPENAI_API_KEY` | `None` | API key for OpenAI GPT and embedding models. |
| `REASONING_MODEL` | `claude-3-5-sonnet-20241022` | Model identifier for causal analysis and walkthrough generation. |
| `EMBEDDING_MODEL` | `text-embedding-3-large` | OpenAI embedding model for vector generation. |
| `EMBEDDING_DIMENSION` | `1536` | Output dimension for vector embeddings stored in `pgvector`. |
| `GITHUB_CLIENT_ID` | `None` | GitHub OAuth App Client ID. |
| `GITHUB_WEBHOOK_SECRET` | `None` | HMAC-SHA256 secret for validating incoming GitHub webhook payloads. |
| `RATE_LIMIT_PER_MINUTE` | `60` | Sliding-window request rate limit per client IP. |
| `MAX_DIFF_CONTEXT_TOKENS`| `6000` | Token ceiling per candidate commit diff to prevent prompt bloat. |

---

## System Architecture

The following diagram illustrates CLUDE's end-to-end component topology, highlighting the separation between ingestion, intelligence, and persistence tiers.

*Figure 1: High-level architectural flowchart of CLUDE.*
```mermaid
flowchart LR
    classDef highlight fill:#4f46e5,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef standard fill:#1e293b,stroke:#475569,stroke-width:1px,color:#f8fafc;

    CLIENT[Client Tier<br/>Next.js 14 Web App]:::standard
    GW[API Gateway<br/>FastAPI / Rate Limiter]:::standard

    subgraph Ingestion["Ingestion Tier"]
        GH_PULL[GitHub Connector<br/>REST & GraphQL API]:::standard
        AST_PARSE[AST Parser & Chunker<br/>Tree-sitter Syntax Engine]:::standard
        TRACE_PARSE[Stack Trace Parser<br/>Frame Normalizer]:::standard
    end

    subgraph Intelligence["Intelligence Layer"]
        VEC_SRV[Embedding Engine<br/>Vector Similarity Search]:::standard
        REASONING[Causal Reasoning Engine<br/>Claude 3.5 Sonnet / GPT-4o]:::highlight
        ONBOARD_SYN[Architecture Synthesizer<br/>Topology & Danger Zones]:::standard
    end

    subgraph Data["Persistence Layer"]
        PG[(PostgreSQL 16<br/>+ pgvector)]:::standard
        REDIS[(Redis 7<br/>Cache & Queues)]:::standard
    end

    CLIENT -->|HTTPS / SSE| GW
    GW --> TRACE_PARSE
    GW --> GH_PULL
    
    GH_PULL --> AST_PARSE
    AST_PARSE --> VEC_SRV
    TRACE_PARSE --> REASONING

    VEC_SRV --> PG
    AST_PARSE --> PG
    REASONING --> PG
    ONBOARD_SYN --> PG
    
    GW --> REDIS
    REASONING --> REDIS
    ONBOARD_SYN --> REDIS
```

---

## Core Workflow Sequence

The following sequence diagram outlines both the synchronous root-cause analysis path and the asynchronous background webhook ingestion pipeline.

*Figure 2: Sequence of synchronous error analysis and asynchronous commit ingestion.*
```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Client
    participant GW as API Gateway
    participant Parser as Stack Trace Parser
    participant Engine as Causal Reasoning Engine
    participant DB as PostgreSQL + pgvector
    participant Hook as GitHub Webhook
    participant Worker as Celery Worker

    %% Synchronous RCA Path
    Dev->>GW: POST /api/v1/rca/analyze (raw trace)
    GW->>Parser: Parse & normalize frames
    Parser-->>GW: File paths, line numbers, symbols
    GW->>DB: Query candidate commits touching frames
    DB-->>GW: Candidate commits & diff hunks
    GW->>Engine: Evaluate causal likelihood (LLM Prompt)
    Engine-->>GW: Ranked candidates + plain-English reasoning
    GW->>DB: Persist AnalysisRun & RankedCandidate records
    GW-->>Dev: Return ranked root-cause report

    %% Asynchronous Webhook Path
    Note over Hook,Worker: Asynchronous Background Ingestion
    Hook->>GW: POST /api/v1/webhooks/github (push event)
    GW->>Worker: Enqueue incremental delta sync
    GW-->>Hook: 202 Accepted
    Worker->>Worker: Fetch commit diffs & chunk modified files
    Worker->>DB: Upsert embeddings & invalidate stale vectors
```

---

## Root-Cause Decision Flow

The following decision chart outlines how CLUDE retrieves candidate commits, widens the search window when direct line matches are absent, and applies confidence thresholds to candidate results.

*Figure 3: Decision tree for candidate correlation and confidence filtering.*
```mermaid
flowchart TD
    classDef highlight fill:#4f46e5,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef standard fill:#1e293b,stroke:#475569,stroke-width:1px,color:#f8fafc;

    START([Stack Trace Ingested]):::standard
    PARSE[Extract Stack Frames & Normalize Paths]:::standard
    MATCH_CHECK{Commits touch<br/>implicated lines?}:::standard
    DIRECT[Retrieve Direct Line Commits & Hunks]:::standard
    WIDEN[Widen Search: Query Semantic Vectors & Fallback Commits]:::standard
    LLM_CALL[LLM Causal Reasoning & Explanation Generation]:::highlight
    SCORE_CHECK{Causal Score<br/>Evaluation}:::standard
    SURFACE[High Likelihood >= 0.80<br/>Surface at Top Rank with Fix]:::standard
    CAVEAT[Plausible 0.50 - 0.79<br/>Include with Explanatory Caveat]:::standard
    SUPPRESS[Low Likelihood < 0.50<br/>Suppress or Mark as Unlikely]:::standard

    START --> PARSE
    PARSE --> MATCH_CHECK
    MATCH_CHECK -- Yes --> DIRECT
    MATCH_CHECK -- No --> WIDEN
    DIRECT --> LLM_CALL
    WIDEN --> LLM_CALL
    LLM_CALL --> SCORE_CHECK
    SCORE_CHECK -- Score >= 0.80 --> SURFACE
    SCORE_CHECK -- 0.50 <= Score < 0.80 --> CAVEAT
    SCORE_CHECK -- Score < 0.50 --> SUPPRESS
```

---

## Database Schema & Entity Relationships

The relational schema co-locates relational git entities with 1536-dimensional vector embeddings in PostgreSQL using `pgvector`.

*Figure 4: Entity-Relationship diagram illustrating core database models.*
```mermaid
erDiagram
    ORGANIZATIONS ||--o{ REPOSITORIES : owns
    REPOSITORIES ||--o{ COMMITS : contains
    REPOSITORIES ||--o{ EMBEDDINGS : indexes
    COMMITS ||--o{ DIFFS : has
    REPOSITORIES ||--o{ STACK_TRACES : receives
    STACK_TRACES ||--o{ ANALYSIS_RUNS : triggers
    ANALYSIS_RUNS ||--o{ RANKED_CANDIDATES : produces
    COMMITS ||--o{ RANKED_CANDIDATES : references
    REPOSITORIES ||--o{ ONBOARDING_WALKTHROUGHS : generates
    ONBOARDING_WALKTHROUGHS ||--o{ WALKTHROUGH_SECTIONS : contains

    ORGANIZATIONS {
        uuid id PK
        string name
        timestamp created_at
    }
    REPOSITORIES {
        uuid id PK
        uuid org_id FK
        bigint github_repo_id
        string full_name
        string default_branch
        string indexing_status
        string last_indexed_sha
        timestamp last_indexed_at
    }
    COMMITS {
        uuid id PK
        uuid repo_id FK
        string commit_sha
        string author_name
        text commit_message
        timestamp committed_at
    }
    DIFFS {
        uuid id PK
        uuid commit_id FK
        string file_path
        string change_type
        text patch_content
        jsonb parsed_hunks
    }
    EMBEDDINGS {
        uuid id PK
        uuid repo_id FK
        string file_path
        string symbol_name
        string chunk_type
        int start_line
        int end_line
        text content_hash
        vector embedding
    }
    STACK_TRACES {
        uuid id PK
        uuid repo_id FK
        string source
        text raw_payload
        string error_type
        text error_message
        jsonb parsed_frames
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
        uuid analysis_run_id FK
        uuid commit_id FK
        numeric causal_score
        int rank_position
        text plain_english_reasoning
        text reproduction_hypothesis
        text suggested_fix
        jsonb matched_files
    }
    ONBOARDING_WALKTHROUGHS {
        uuid id PK
        uuid repo_id FK
        string commit_sha
        string status
        text summary
        text system_diagram_mermaid
    }
    WALKTHROUGH_SECTIONS {
        uuid id PK
        uuid walkthrough_id FK
        string section_type
        string title
        text content_markdown
        string risk_level
        jsonb referenced_files
        int display_order
    }
```

---

## Core Algorithm: Semantic Causal Attribution

Unlike naive tools that simply report who last edited a line of code, CLUDE solves for **causal probability**:

$$\mathcal{P}(\text{Commit}_k \mid \text{Error } E, \text{Trace } T) = f(\Delta_{\text{AST}}, \text{Hunks}_k, \text{Frames}_T, \text{Semantics}(E))$$

1. **Frame Resolution**: Extracts caller coordinates ($F_{\text{file}}, F_{\text{line}}, F_{\text{symbol}}$) from the raw stack trace.
2. **Context Assembly**: Retrieves commit diff hunks touching $F_{\text{file}}$ within $\Delta t$, assembling surrounding function context and commit messages while filtering generated assets.
3. **Multi-Factor LLM Reasoning**: Evaluates direct frame matches, semantic vector proximity between the error description and diff hunks, and side-effects on downstream callers.
4. **Calibrated Output**: Generates a continuous score from $0.00$ to $1.00$, accompanied by an explainable causal rationale and concrete remediation patch.

*Figure 5: Information convergence into the causal ranking engine.*
```mermaid
flowchart LR
    classDef highlight fill:#4f46e5,stroke:#818cf8,stroke-width:2px,color:#ffffff;
    classDef standard fill:#1e293b,stroke:#475569,stroke-width:1px,color:#f8fafc;

    TRACE[Stack Trace & Error Payload]:::standard
    DIFFS[Git Diff Hunks & AST Deltas]:::standard
    VECTORS[pgvector Semantic Similarity]:::standard
    META[Commit Author, Date & Message]:::standard
    
    ENGINE[CLUDE Causal Reasoning Engine<br/>Claude 3.5 Sonnet / GPT-4o]:::highlight
    
    REPORT[Ranked Causal Report<br/>Score + Plain-English Reason + Fix]:::standard

    TRACE --> ENGINE
    DIFFS --> ENGINE
    VECTORS --> ENGINE
    META --> ENGINE
    ENGINE --> REPORT
```

---

## Error Handling Reference

| Error Code | HTTP Status | Description | Remediation |
| :--- | :--- | :--- | :--- |
| `TRACE_UNPARSEABLE` | `400 Bad Request` | Provided log text contains no recognizable stack frame patterns. | Verify the payload contains standard stack trace formatting for supported languages. |
| `REPO_NOT_CONNECTED` | `404 Not Found` | Target `repo_id` does not exist or has not been authorized. | Connect the repository via `/api/v1/repos/connect`. |
| `INDEX_IN_PROGRESS` | `409 Conflict` | Operations requested while initial AST indexing is underway. | Poll `/api/v1/repos/{id}/index-status` until status reaches `COMPLETED`. |
| `NO_CANDIDATES_FOUND` | `200 OK` | Trace parsed successfully, but no matching commits were found in time window. | Widen the `time_window_days` parameter in the analysis request. |
| `LLM_TIMEOUT` | `504 Gateway Timeout` | Upstream AI provider (Anthropic/OpenAI) exceeded deadline. | System automatically retries with exponential backoff before returning 504. |
| `RATE_LIMITED` | `429 Too Many Requests` | IP address or tenant exceeded configured requests per minute. | Wait 60 seconds before issuing subsequent requests. |

---

## Testing & Verification

### Running Backend Unit & Integration Tests
```bash
cd clude/backend
pytest -v tests/
```

### Running the Injected Bug Benchmark Test
Validate causal ranking accuracy against a known injected regression fixture:
```bash
pytest -v tests/test_rca_integration.py -k "test_rca_pipeline_with_injected_bug_fixture"
```

### Running Frontend Tests & Type Checking
```bash
cd clude/frontend
npm run lint
npm run build
```

---

## Design Philosophy

1. **Explainability Over Assertion**: A confidence score without an explanation is unusable during an incident. CLUDE always provides the mechanism of failure and step-by-step reproduction reasoning.
2. **Calibrated Confidence**: CLUDE never outputs performative 100% assertions; scores reflect genuine evidence quality, distinguishing direct line regressions from indirect semantic side-effects.
3. **Least-Privilege Security**: Repositories are accessed strictly read-only (`contents: read`, `pull_requests: read`). Raw source code is never permanently retained.
4. **Incremental Over Exhaustive**: Background indexing calculates AST chunk SHA-256 hashes to process only modified files, minimizing LLM embedding overhead.
5. **Unified Substrate**: Both Root-Cause Analysis and Onboarding Assistant share the same ingestion, AST chunking, and reasoning core.

---

## Roadmap

- [x] Multi-language stack trace parser (Python, TypeScript, Go, Java, Rust)
- [x] LLM causal reasoning pipeline with calibrated confidence scoring
- [x] Automated codebase onboarding walkthroughs with Mermaid.js architecture graphs
- [x] GitHub push webhook listener with incremental AST delta indexing
- [ ] **Sentry & Datadog Native Integrations**: Direct error stream ingestion with automated triage
- [ ] **Monorepo Boundary Isolation**: Cross-package dependency resolution across Turborepo and Nx workspaces
- [ ] **Slack Incident Bot**: Automated RCA candidate dispatch directly into `#incident` channels
- [ ] **CI PR Risk Analysis**: Proactive danger-zone warnings on incoming pull requests before merging

---

## Authors & Contributors

- **CLUDE Core Engineering Team** ([@clude-ai](https://github.com/clude-ai))

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
