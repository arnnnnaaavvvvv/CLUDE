import asyncio
import uuid
from datetime import datetime, timezone
from sqlalchemy import select

try:
    from celery import shared_task
except ImportError:
    # Fallback decorator if Celery is not installed
    def shared_task(*args, **kwargs):
        def decorator(f):
            f.delay = lambda *a, **kw: f(*a, **kw)
            return f
        return decorator

from app.core.database import async_session_maker
from app.models.repo import Repository
from app.models.commit import Commit, Diff
from app.models.embedding import CodeEmbedding
from app.services.github_service import GitHubService
from app.services.ast_parser import ASTCodeChunker
from app.services.embedding_service import EmbeddingService
from app.services.onboarding_engine import OnboardingEngine
from app.core.security import decrypt_token


def run_async(coro):
    """Utility to run async coroutine in sync Celery task worker."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@shared_task(name="tasks.index_repository")
def index_repository_task(repo_id_str: str):
    """Background task to clone/fetch repo history, extract diffs, chunk AST, and generate embeddings."""
    return run_async(_async_index_repository(uuid.UUID(repo_id_str)))


async def _async_index_repository(repo_id: uuid.UUID):
    async with async_session_maker() as session:
        repo = await session.get(Repository, repo_id)
        if not repo:
            return {"error": "Repository not found"}

        repo.indexing_status = "INDEXING"
        await session.commit()

        token = decrypt_token(repo.encrypted_access_token) if repo.encrypted_access_token else None
        gh = GitHubService(access_token=token)
        embedding_service = EmbeddingService()

        try:
            commits_data = await gh.fetch_recent_commits(repo.full_name, branch=repo.default_branch or "main", limit=50)

            for c_data in commits_data:
                sha = c_data["sha"]
                existing = await session.execute(
                    select(Commit).where(Commit.repo_id == repo.id, Commit.commit_sha == sha)
                )
                if existing.scalar_one_or_none():
                    continue

                commit_obj = Commit(
                    repo_id=repo.id,
                    commit_sha=sha,
                    author_name=c_data["commit"]["author"]["name"],
                    author_email=c_data["commit"]["author"]["email"],
                    commit_message=c_data["commit"]["message"],
                    committed_at=datetime.fromisoformat(c_data["commit"]["author"]["date"].replace("Z", "+00:00")),
                )
                session.add(commit_obj)
                await session.flush()

                commit_diff_detail = await gh.fetch_commit_diff(repo.full_name, sha)
                for file_entry in commit_diff_detail.get("files", []):
                    patch = file_entry.get("patch", "")
                    diff_obj = Diff(
                        commit_id=commit_obj.id,
                        file_path=file_entry["filename"],
                        change_type=file_entry.get("status", "MODIFIED").upper(),
                        patch_content=patch,
                        parsed_hunks=[],
                        token_count=len(patch.split()) if patch else 0
                    )
                    session.add(diff_obj)

            tree = await gh.fetch_repo_tree(repo.full_name, branch=repo.default_branch or "main")
            for item in tree[:30]:
                path = item.get("path", "")
                if item.get("type") == "blob" and any(path.endswith(ext) for ext in [".py", ".ts", ".js", ".tsx", ".jsx", ".go", ".rs"]):
                    content = await gh.fetch_file_content(repo.full_name, path, ref=repo.default_branch or "main")
                    if content:
                        chunks = ASTCodeChunker.chunk_file(path, content)
                        for chunk in chunks:
                            vector = await embedding_service.get_embedding(chunk.content)
                            embed_obj = CodeEmbedding(
                                repo_id=repo.id,
                                file_path=chunk.file_path,
                                symbol_name=chunk.symbol_name,
                                chunk_type=chunk.chunk_type,
                                start_line=chunk.start_line,
                                end_line=chunk.end_line,
                                content_raw=chunk.content,
                                content_hash=chunk.content_hash,
                                embedding=vector
                            )
                            session.add(embed_obj)

            repo.indexing_status = "COMPLETED"
            repo.last_indexed_at = datetime.now(timezone.utc)
            if commits_data:
                repo.last_indexed_sha = commits_data[0]["sha"]

            await session.commit()
            return {"status": "SUCCESS", "repo_id": str(repo_id)}

        except Exception as e:
            repo.indexing_status = "FAILED"
            await session.commit()
            return {"status": "FAILED", "error": str(e)}


@shared_task(name="tasks.generate_onboarding")
def generate_onboarding_task(repo_id_str: str, commit_sha: str = None):
    return run_async(_async_generate_onboarding(uuid.UUID(repo_id_str), commit_sha))


async def _async_generate_onboarding(repo_id: uuid.UUID, commit_sha: str = None):
    async with async_session_maker() as session:
        repo = await session.get(Repository, repo_id)
        if not repo:
            return {"error": "Repository not found"}

        engine = OnboardingEngine()
        walkthrough = await engine.generate_walkthrough(session, repo, commit_sha)
        return {"status": "SUCCESS", "walkthrough_id": str(walkthrough.id)}
