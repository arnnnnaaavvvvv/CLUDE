export interface RepoItem {
  id: string;
  github_repo_id: number;
  full_name: string;
  default_branch: string;
  is_private: boolean;
  indexing_status: string;
  last_indexed_sha: string | null;
  last_indexed_at: string | null;
  created_at: string;
}

export const initialRepos: RepoItem[] = [
  {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    github_repo_id: 10279,
    full_name: "facebook/react",
    default_branch: "main",
    is_private: false,
    indexing_status: "COMPLETED",
    last_indexed_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "e34b1a20-88fc-42fa-9a4f-56bbcc381a11",
    github_repo_id: 70420,
    full_name: "vercel/next.js",
    default_branch: "canary",
    is_private: false,
    indexing_status: "COMPLETED",
    last_indexed_sha: "c901f4a1847d8b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "f1092a10-99fc-42fa-8a3f-11bbcc381a88",
    github_repo_id: 12221,
    full_name: "fastapi/fastapi",
    default_branch: "master",
    is_private: false,
    indexing_status: "COMPLETED",
    last_indexed_sha: "88b1f4a1847d8b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }
];

// Global in-memory cache across serverless warm invocations
export const globalRepos: RepoItem[] = [...initialRepos];
