import { NextResponse } from "next/server";
import { getOnboardingForRepo } from "@/lib/onboardingCatalog";
import { globalRepos } from "@/lib/reposStore";

export async function GET(req: Request, { params }: { params: { repo_id: string } }) {
  const matched = globalRepos.find((r) => r.id === params.repo_id || r.full_name === params.repo_id);
  const walkthrough = getOnboardingForRepo(params.repo_id, matched?.full_name);
  return NextResponse.json(walkthrough);
}
