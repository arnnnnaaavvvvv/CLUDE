import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { repo_id: string } }) {
  const walkthrough = {
    id: "b1820120-d3a9-4672-a1f9-8669c2789182",
    repo_id: params.repo_id,
    commit_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    status: "COMPLETED",
    summary: "Decoupled full-stack architecture with API gateway, domain services, pgvector persistence, and async worker pipelines.",
    system_diagram_mermaid: "graph TD\n  Client[Next.js Client] --> Gateway[API Gateway / Auth]\n  Gateway --> DomainSvc[Domain Business Logic]\n  DomainSvc --> DB[(PostgreSQL + pgvector)]\n  DomainSvc --> TaskQueue[(Redis 7 & Celery)]",
    sections: [
      {
        id: "sec-1",
        section_type: "OVERVIEW",
        title: "System Topology & High-Level Architecture",
        content_markdown: "### System Topology\n\nIncoming developer requests enter through the API router tier, perform authentication and token verification, and dispatch tasks to domain-specific services or background worker queues.\n\n- **Client Layer**: Next.js 14 App Router rendering dark-mode developer interfaces.\n- **API Substrate**: Fast, asynchronous endpoints with token rate limiting.\n- **Persistence Layer**: ACID relational data co-located with 1536-dim vector embeddings.",
        risk_level: "LOW",
        referenced_files: ["src/app/page.tsx", "src/api/main.py", "package.json"],
        display_order: 1
      },
      {
        id: "sec-2",
        section_type: "CRITICAL_PATH",
        title: "Primary Request & Execution Pipelines",
        content_markdown: "### Execution Pipelines\n\n1. **Trace Ingestion & Coordinate Normalization**: Extracts exact file coordinates and lines.\n2. **Git Commit Graph & Diff Correlator**: Queries commits modifying failing frames within temporal windows.\n3. **Causal Reasoning & LLM Prompt Pipeline**: Evaluates candidate diffs and scores causal likelihood.",
        risk_level: "MEDIUM",
        referenced_files: ["src/services/rca_engine.ts", "src/services/ast_parser.ts"],
        display_order: 2
      },
      {
        id: "sec-3",
        section_type: "DANGER_ZONE",
        title: "Danger Zone: High-Churn Concurrency & Storage Mutex",
        content_markdown: "### ⚠️ Danger Zones & High Risk Modules\n\nThe following modules have exhibited high churn and dense cross-module dependencies:\n\n- **`src/core/locking/redis_mutex.ts`**\n- **`src/services/payment.ts`**\n\n> **Architect Note**: Any modifications to distributed lock parameters or transaction isolation levels require exhaustive regression tests and explicit review from core maintainers.",
        risk_level: "CRITICAL",
        referenced_files: ["src/core/locking/redis_mutex.ts", "src/services/payment.ts"],
        display_order: 3
      }
    ],
    created_at: new Date().toISOString()
  };

  return NextResponse.json(walkthrough);
}
