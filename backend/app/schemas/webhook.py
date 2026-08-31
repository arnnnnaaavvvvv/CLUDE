from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class GitHubCommitAuthor(BaseModel):
    name: str
    email: str
    username: Optional[str] = None


class GitHubWebhookCommit(BaseModel):
    id: str
    message: str
    timestamp: str
    author: GitHubCommitAuthor
    added: List[str] = []
    removed: List[str] = []
    modified: List[str] = []


class GitHubWebhookRepository(BaseModel):
    id: int
    name: str
    full_name: str
    default_branch: str


class GitHubPushWebhookPayload(BaseModel):
    ref: str
    before: str
    after: str
    repository: GitHubWebhookRepository
    commits: List[GitHubWebhookCommit] = []
    head_commit: Optional[GitHubWebhookCommit] = None


class SentryWebhookPayload(BaseModel):
    id: Optional[str] = None
    project: Optional[str] = None
    message: Optional[str] = None
    event: Optional[Dict[str, Any]] = None
