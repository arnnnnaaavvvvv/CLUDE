import { NextResponse } from "next/server";
import { z } from "zod";
import { globalRepos, RepoItem } from "@/lib/reposStore";

const CreateRepoSchema = z.object({
  full_name: z.string().min(1, "Repository name is required"),
  github_repo_id: z.number().optional(),
  default_branch: z.string().optional().default("main"),
});

export const GET = async () => {
  return NextResponse.json(globalRepos);
};

export const POST = async (req: Request) => {
  try {
    const json = await req.json().catch(() => ({}));
    const parseResult = CreateRepoSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid repository payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    let fullName = parseResult.data.full_name.trim();

    // Clean URL prefixes if any slipped through
    fullName = fullName.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    fullName = fullName.replace(/^git@github\.com:/i, "");
    fullName = fullName.replace(/\.git$/i, "");
    fullName = fullName.replace(/^\/+|\/+$/g, "");

    const newRepo: RepoItem = {
      id: crypto.randomUUID(),
      github_repo_id: parseResult.data.github_repo_id || Math.floor(100000 + Math.random() * 900000),
      full_name: fullName,
      default_branch: parseResult.data.default_branch || "main",
      is_private: false,
      indexing_status: "COMPLETED",
      last_indexed_sha: "a1f4c39e" + Math.random().toString(36).substring(2, 8),
      last_indexed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    // Check if already in list
    const existingIndex = globalRepos.findIndex((r) => r.full_name.toLowerCase() === fullName.toLowerCase());
    if (existingIndex >= 0) {
      return NextResponse.json(globalRepos[existingIndex]);
    }

    globalRepos.unshift(newRepo);
    return NextResponse.json(newRepo, { status: 202 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add repo" }, { status: 400 });
  }
};
