import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const newRepo = {
    id: crypto.randomUUID(),
    github_repo_id: body.github_repo_id || Math.floor(100000 + Math.random() * 900000),
    full_name: body.full_name,
    default_branch: body.default_branch || "main",
    is_private: !!body.is_private,
    indexing_status: "COMPLETED",
    last_indexed_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  return NextResponse.json(newRepo, { status: 202 });
}
