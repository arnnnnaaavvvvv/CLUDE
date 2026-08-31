import { NextResponse } from "next/server";

// In-memory / serverless store for demo/Vercel serverless mode
let mockRepos = [
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
  }
];

export async function GET() {
  return NextResponse.json(mockRepos);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newRepo = {
    id: crypto.randomUUID(),
    github_repo_id: body.github_repo_id || Math.floor(100000 + Math.random() * 900000),
    full_name: body.full_name,
    default_branch: body.default_branch || "main",
    is_private: !!body.is_private,
    indexing_status: "COMPLETED",
    last_indexed_sha: "f3b9c02d1847" + Math.random().toString(36).substring(2, 8),
    last_indexed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  mockRepos.unshift(newRepo);
  return NextResponse.json(newRepo, { status: 202 });
}
