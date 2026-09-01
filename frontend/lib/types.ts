export interface Repository {
  id: string;
  github_repo_id: number;
  full_name: string;
  default_branch: string;
  is_private: boolean;
  indexing_status: "PENDING" | "INDEXING" | "COMPLETED" | "FAILED";
  last_indexed_sha: string | null;
  last_indexed_at: string | null;
  created_at: string;
}

export interface IndexStatus {
  repo_id: string;
  full_name: string;
  indexing_status: string;
  indexed_commits_count: number;
  embeddings_count: number;
  last_indexed_sha: string | null;
  last_indexed_at: string | null;
}

export interface ParsedStackFrame {
  file_path: string;
  line_number: number;
  column_number: number | null;
  function_name: string | null;
  raw_frame_text: string;
}

export interface CandidateCommit {
  sha: string;
  author_name: string | null;
  author_email: string | null;
  commit_message: string;
  committed_at: string;
}

export interface RankedCandidate {
  rank: number;
  causal_score: number;
  commit: CandidateCommit;
  plain_english_reasoning: string;
  reproduction_hypothesis: string | null;
  suggested_fix: string | null;
  matched_files: string[];
}

export interface AnalysisRun {
  analysis_run_id: string;
  trace_id: string;
  repo_id: string;
  status: string;
  error_type: string | null;
  error_message: string | null;
  parsed_frames: ParsedStackFrame[];
  execution_duration_sec: number | null;
  model_used: string;
  ranked_candidates: RankedCandidate[];
  created_at: string;
}

export interface WalkthroughSection {
  id: string;
  section_type: "OVERVIEW" | "CRITICAL_PATH" | "DANGER_ZONE" | "DATA_FLOW" | "SETUP_GUIDE";
  title: string;
  content_markdown: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | null;
  referenced_files: any[];
  display_order: number;
}

export interface OnboardingWalkthrough {
  id: string;
  repo_id: string;
  commit_sha: string;
  status: string;
  summary: string | null;
  system_diagram_mermaid: string | null;
  sections: WalkthroughSection[];
  created_at: string;
}
