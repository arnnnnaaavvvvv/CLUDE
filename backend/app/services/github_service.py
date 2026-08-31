import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.core.config import settings


class GitHubService:
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CLUDE-AI-Engine"
        }
        if self.access_token:
            self.headers["Authorization"] = f"Bearer {self.access_token}"

    @classmethod
    async def exchange_code_for_token(cls, code: str) -> Dict[str, Any]:
        """Exchange temporary OAuth code for GitHub user access token."""
        url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=data, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def get_repository_details(self, full_name: str) -> Dict[str, Any]:
        """Fetch repo metadata from GitHub REST API."""
        url = f"https://api.github.com/repos/{full_name}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def fetch_recent_commits(
        self, full_name: str, branch: str = "main", limit: int = 50, since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Fetch recent commit history with author, message, and metadata."""
        url = f"https://api.github.com/repos/{full_name}/commits"
        params: Dict[str, Any] = {"sha": branch, "per_page": min(limit, 100)}
        if since:
            params["since"] = since.isoformat()

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self.headers, params=params)
            resp.raise_for_status()
            return resp.json()

    async def fetch_commit_diff(self, full_name: str, commit_sha: str) -> Dict[str, Any]:
        """Fetch individual commit diff details including modified files and hunks."""
        url = f"https://api.github.com/repos/{full_name}/commits/{commit_sha}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self.headers)
            resp.raise_for_status()
            return resp.json()

    async def fetch_file_content(self, full_name: str, path: str, ref: str = "main") -> Optional[str]:
        """Fetch raw file content from GitHub repository."""
        url = f"https://api.github.com/repos/{full_name}/contents/{path}"
        params = {"ref": ref}
        headers = dict(self.headers)
        headers["Accept"] = "application/vnd.github.v3.raw"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers, params=params)
            if resp.status_code == 200:
                return resp.text
            return None

    async def fetch_repo_tree(self, full_name: str, branch: str = "main") -> List[Dict[str, Any]]:
        """Fetch recursive file tree of the repository for architectural analysis."""
        url = f"https://api.github.com/repos/{full_name}/git/trees/{branch}?recursive=1"
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("tree", [])
            return []
