import { NextResponse } from "next/server";
import { z } from "zod";
import { getOnboardingForRepo } from "@/lib/onboardingCatalog";
import { globalRepos } from "@/lib/reposStore";

const ParamsSchema = z.object({
  repo_id: z.string().min(1, "repo_id is required"),
});

export const POST = async (req: Request, { params }: { params: { repo_id: string } }) => {
  const parseResult = ParamsSchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid repository parameter" }, { status: 400 });
  }

  const repoId = parseResult.data.repo_id;
  const matched = globalRepos.find((r) => r.id === repoId || r.full_name === repoId);
  const walkthrough = getOnboardingForRepo(repoId, matched?.full_name);
  return NextResponse.json(walkthrough, { status: 202 });
};
