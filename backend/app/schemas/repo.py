from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


class RepoConnectRequest(BaseModel):
    github_repo_id: int = Field(..., description="GitHub repository ID")
    full_name: str = Field(..., example="facebook/react", description="Repository full name 'owner/repo'")
    default_branch: str = Field(default="main", description="Primary branch name")
    access_token: Optional[str] = Field(default=None, description="GitHub OAuth or Personal Access Token")
    is_private: bool = Field(default=False)


class RepoResponse(BaseModel):
    id: UUID
    github_repo_id: int
    full_name: str
    default_branch: str
    is_private: bool
    indexing_status: str
    last_indexed_sha: Optional[str] = None
    last_indexed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class IndexStatusResponse(BaseModel):
    repo_id: UUID
    full_name: str
    indexing_status: str
    indexed_commits_count: int
    embeddings_count: int
    last_indexed_sha: Optional[str]
    last_indexed_at: Optional[datetime]
