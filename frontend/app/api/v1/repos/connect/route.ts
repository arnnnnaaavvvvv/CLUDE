import { NextResponse } from "next/server";
import { globalRepos, RepoItem } from "@/lib/reposStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let fullName = (body.full_name || "").trim();

    fullName = fullName.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    fullName = fullName.replace(/^git@github\.com:/i, "");
    fullName = fullName.replace(/\.git$/i, "");
    fullName = fullName.replace(/^\/+|\/+$/g, "");

    const newRepo: RepoItem = {
      id: crypto.randomUUID(),
      github_repo_id: body.github_repo_id || Math.floor(100000 + Math.random() * 900000),
      full_name: fullName,
      default_branch: body.default_branch || "main",
      is_private: false,
      indexing_status: "COMPLETED",
      last_indexed_sha: "a1f4c39e" + Math.random().toString(36).substring(2, 8),
      last_indexed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const existingIndex = globalRepos.findIndex((r) => r.full_name.toLowerCase() === fullName.toLowerCase());
    if (existingIndex >= 0) {
      return NextResponse.json(globalRepos[existingIndex]);
    }

    globalRepos.unshift(newRepo);
    return NextResponse.json(newRepo, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to connect repo" }, { status: 400 });
  }
}
