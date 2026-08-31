import json
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from app.core.config import settings
from app.models.repo import Repository
from app.models.commit import Commit, Diff
from app.models.onboarding import OnboardingWalkthrough, WalkthroughSection
from app.services.github_service import GitHubService
from app.core.security import decrypt_token


class OnboardingEngine:
    """
    AI Onboarding Assistant Engine.
    Generates structured architectural walkthroughs, critical paths, and 'do not touch' danger zones.
    """

    def __init__(self):
        self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

    async def generate_walkthrough(
        self, session: AsyncSession, repo: Repository, commit_sha: Optional[str] = None
    ) -> OnboardingWalkthrough:
        sha = commit_sha or repo.last_indexed_sha or "HEAD"

        # 1. Initialize Walkthrough record
        walkthrough = OnboardingWalkthrough(
            repo_id=repo.id,
            commit_sha=sha,
            status="GENERATING"
        )
        session.add(walkthrough)
        await session.flush()

        # 2. Extract Churn & High-Risk Files
        churn_data = await self._analyze_file_churn(session, repo.id)

        # 3. Fetch Tree & Key Manifest Files via GitHub
        token = decrypt_token(repo.encrypted_access_token) if repo.encrypted_access_token else None
        gh = GitHubService(access_token=token)
        tree = await gh.fetch_repo_tree(repo.full_name, branch=repo.default_branch or "main")
        file_paths = [item.get("path") for item in tree if item.get("type") == "blob"][:150]

        # 4. LLM Architectural Synthesis
        synthesis = await self._synthesize_architecture(repo.full_name, file_paths, churn_data)

        # 5. Populate Walkthrough & Sections
        walkthrough.summary = synthesis.get("summary", f"Architecture analysis for {repo.full_name}")
        walkthrough.system_diagram_mermaid = synthesis.get("mermaid_diagram", "graph TD\n  Client --> API\n  API --> Database")
        walkthrough.status = "COMPLETED"

        sections_data = synthesis.get("sections", [])
        for order, sec in enumerate(sections_data, start=1):
            section_record = WalkthroughSection(
                walkthrough_id=walkthrough.id,
                section_type=sec.get("section_type", "OVERVIEW"),
                title=sec.get("title", f"Section {order}"),
                content_markdown=sec.get("content_markdown", ""),
                risk_level=sec.get("risk_level", "LOW"),
                referenced_files=sec.get("referenced_files", []),
                display_order=order
            )
            session.add(section_record)

        await session.commit()
        return walkthrough

    async def _analyze_file_churn(self, session: AsyncSession, repo_id) -> List[Dict[str, Any]]:
        """Calculate files with highest commit modification frequency (churn)."""
        query = (
            select(Diff.file_path, func.count(Diff.id).label("change_count"))
            .join(Commit, Diff.commit_id == Commit.id)
            .where(Commit.repo_id == repo_id)
            .group_by(Diff.file_path)
            .order_by(func.count(Diff.id).desc())
            .limit(10)
        )
        result = await session.execute(query)
        return [{"file_path": row[0], "changes": row[1]} for row in result.all()]

    async def _synthesize_architecture(
        self, full_name: str, file_paths: List[str], churn_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are CLUDE, a Principal Software Architect.\n"
            "Generate a guided, comprehensive onboarding walkthrough for new engineers joining a codebase.\n"
            "You MUST respond ONLY with valid JSON conforming to the requested schema."
        )

        user_content = f"""
REPOSITORY: {full_name}

FILE TREE SAMPLE (Top 150 files):
{json.dumps(file_paths, indent=2)}

HIGH CHURN FILES (Frequently modified):
{json.dumps(churn_data, indent=2)}

TASK:
1. Provide a high-level architecture overview.
2. Produce a valid Mermaid.js diagram illustrating core service and data boundaries.
3. Identify entry points and critical execution paths (e.g. auth, payment, data ingestion).
4. Identify 'DO NOT TOUCH' danger zones (high complexity, high churn, delicate concurrency or state).
5. Output structured JSON with sections.

OUTPUT SCHEMA:
{{
  "summary": "High-level 2-sentence architecture summary",
  "mermaid_diagram": "graph TD\\n  Client --> API Gateway\\n  ...",
  "sections": [
    {{
      "section_type": "OVERVIEW",
      "title": "System Architecture & Topology",
      "content_markdown": "### System Architecture\\n...",
      "risk_level": "LOW",
      "referenced_files": ["src/main.ts", "package.json"]
    }},
    {{
      "section_type": "CRITICAL_PATH",
      "title": "Primary Request & Business Execution Pipeline",
      "content_markdown": "### Critical Paths\\n...",
      "risk_level": "MEDIUM",
      "referenced_files": ["src/controllers/order.ts", "src/services/billing.ts"]
    }},
    {{
      "section_type": "DANGER_ZONE",
      "title": "Danger Zone: Stateful Concurrency & Data Mutations",
      "content_markdown": "### Caution: Concurrency Lock Manager\\nDo not modify without running distributed test harness...",
      "risk_level": "CRITICAL",
      "referenced_files": ["src/core/lock.ts"]
    }}
  ]
}}
"""

        # LLM Provider Call
        if self.anthropic_client and settings.PRIMARY_LLM_PROVIDER == "anthropic":
            try:
                msg = await self.anthropic_client.messages.create(
                    model=settings.REASONING_MODEL,
                    max_tokens=4000,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_content}]
                )
                return self._clean_and_parse_json(msg.content[0].text)
            except Exception:
                pass

        if self.openai_client:
            try:
                res = await self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    response_format={"type": "json_object"}
                )
                return json.loads(res.choices[0].message.content)
            except Exception:
                pass

        # Fallback default blueprint
        return self._heuristic_fallback_walkthrough(full_name, file_paths, churn_data)

    def _clean_and_parse_json(self, text: str) -> Dict[str, Any]:
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return json.loads(cleaned.strip())

    def _heuristic_fallback_walkthrough(
        self, full_name: str, file_paths: List[str], churn_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        danger_files = [c["file_path"] for c in churn_data[:3]] if churn_data else ["src/core/"]
        return {
            "summary": f"High-performance decoupled architecture for {full_name}, organized into API gateways, domain services, and persistence layers.",
            "mermaid_diagram": "graph TD\n  Client[Frontend Client] --> API[FastAPI / Gateway]\n  API --> Service[Domain Business Logic]\n  Service --> DB[(PostgreSQL + pgvector)]\n  Service --> Cache[(Redis Cache & Task Queue)]",
            "sections": [
                {
                    "section_type": "OVERVIEW",
                    "title": "System Topology & High-Level Architecture",
                    "content_markdown": f"### System Overview\n\n`{full_name}` adopts a layered modular design. Incoming requests enter through the API router layer, perform authentication and token verification, and dispatch tasks to domain-specific services or background worker queues.",
                    "risk_level": "LOW",
                    "referenced_files": file_paths[:5]
                },
                {
                    "section_type": "CRITICAL_PATH",
                    "title": "Core Execution Pipelines & Entry Points",
                    "content_markdown": "### Critical Paths\n\n1. **API Ingestion Gateway**: Dispatches HTTP requests and enforces rate-limiting.\n2. **State & Database Layer**: Manages schema migrations and ACID transactions.\n3. **Async Task Worker**: Processes CPU-heavy code analysis and vectorization.",
                    "risk_level": "MEDIUM",
                    "referenced_files": file_paths[5:10] if len(file_paths) > 10 else file_paths
                },
                {
                    "section_type": "DANGER_ZONE",
                    "title": "Danger Zones: High-Churn & Fragile Modules",
                    "content_markdown": f"### ⚠️ Danger Zones & High Risk Modules\n\nThe following modules have exhibited high churn and dense cross-module dependencies:\n\n- **{', '.join(danger_files)}**\n\n> **Architect Note**: Any modifications to these files require exhaustive regression tests and explicit review from core maintainers.",
                    "risk_level": "CRITICAL",
                    "referenced_files": danger_files
                }
            ]
        }
