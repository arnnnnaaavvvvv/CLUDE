import { NextResponse } from "next/server";
import { z } from "zod";

const ParamsSchema = z.object({
  repo_id: z.string().min(1, "repo_id is required"),
});

export const GET = async (req: Request, { params }: { params: { repo_id: string } }) => {
  const parseResult = ParamsSchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid repository parameter" }, { status: 400 });
  }

  return NextResponse.json({
    repo_id: parseResult.data.repo_id,
    full_name: "facebook/react",
    indexing_status: "COMPLETED",
    indexed_commits_count: 50,
    embeddings_count: 142,
    last_indexed_sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
    last_indexed_at: new Date().toISOString(),
  });
};
