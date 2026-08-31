import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { repo_id: string } }) {
  return NextResponse.json({
    repo_id: params.repo_id,
    full_name: "facebook/react",
    indexing_status: "COMPLETED",
    indexed_commits_count: 50,
    embeddings_count: 142,
    last_indexed_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
  });
}
