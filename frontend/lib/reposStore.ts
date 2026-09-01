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

// Clean start: No pre-uploaded demo repositories. User connects GitHub to populate repositories.
export const initialRepos: RepoItem[] = [];

// Global in-memory cache across serverless warm invocations
export const globalRepos: RepoItem[] = [...initialRepos];
