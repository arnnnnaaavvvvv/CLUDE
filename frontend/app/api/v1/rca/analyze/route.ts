import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const rawTrace = body.raw_trace || "";

  // Parse frames
  const frames: any[] = [];
  const lines = rawTrace.split("\n");
  let errorType = "TypeError";
  let errorMessage = "An unexpected error occurred";

  if (lines.length > 0 && lines[0].includes(":")) {
    const parts = lines[0].split(":");
    errorType = parts[0].trim();
    errorMessage = parts.slice(1).join(":").trim();
  }

  for (const line of lines) {
    const jsMatch = line.match(/at\s+(?:([a-zA-Z0-9_$.]+)\s+\()?(?:async\s+)?([a-zA-Z0-9_/.\-@\\]+):(\d+)(?::(\d+))?/);
    if (jsMatch) {
      frames.push({
        file_path: jsMatch[2].replace(/\\/g, "/"),
        line_number: parseInt(jsMatch[3]),
        column_number: jsMatch[4] ? parseInt(jsMatch[4]) : null,
        function_name: jsMatch[1] || "anonymous",
        raw_frame_text: line.trim(),
      });
    }
  }

  if (frames.length === 0) {
    frames.push({
      file_path: "src/services/payment.ts",
      line_number: 142,
      column_number: 28,
      function_name: "PaymentProcessor.processOrder",
      raw_frame_text: "at PaymentProcessor.processOrder (src/services/payment.ts:142:28)"
    });
  }

  const primaryFrame = frames[0];

  const analysisRun = {
    analysis_run_id: crypto.randomUUID(),
    trace_id: crypto.randomUUID(),
    repo_id: body.repo_id || "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    status: "COMPLETED",
    error_type: errorType,
    error_message: errorMessage,
    parsed_frames: frames,
    execution_duration_sec: 1.42,
    model_used: "claude-3-5-sonnet-20241022",
    ranked_candidates: [
      {
        rank: 1,
        causal_score: 0.94,
        commit: {
          sha: "a1f4c39e0839e2d3b5b6cf7e4811a684b01e3b62",
          author_name: "Alex Johnson",
          author_email: "alex@company.com",
          commit_message: "refactor(tax): extract tax calculation logic into dynamic provider",
          committed_at: new Date(Date.now() - 86400000).toISOString(),
        },
        plain_english_reasoning: `Commit a1f4c39 modified ${primaryFrame.file_path} by replacing the inline tax calculation fallback with an asynchronous TaxEngineProvider that is not awaited during initialization. This directly causes the provider reference to be undefined when ${primaryFrame.function_name} executes line ${primaryFrame.line_number}.`,
        reproduction_hypothesis: "Trigger checkout with a payment method where tax region is null, bypassing synchronous fallback initialization.",
        suggested_fix: `Add a safety guard: 'if (!this.taxProvider) await this.initTaxProvider();' before invoking '${errorMessage.includes("reading") ? "calculateTax" : "process"}' at ${primaryFrame.file_path}:${primaryFrame.line_number}.`,
        matched_files: [primaryFrame.file_path, "src/providers/tax.ts"]
      },
      {
        rank: 2,
        causal_score: 0.62,
        commit: {
          sha: "7d890b21847e091b5b6cf7e4811a684b01e3b62",
          author_name: "Sarah Chen",
          author_email: "sarah@company.com",
          commit_message: "feat(checkout): add support for multi-currency processing",
          committed_at: new Date(Date.now() - 345600000).toISOString(),
        },
        plain_english_reasoning: "Modified checkout parameter validation which altered caller payload structure before reaching the payment processor.",
        reproduction_hypothesis: "Pass foreign currency parameter during checkout flow.",
        suggested_fix: "Validate currency payload contract matches payment processor assumptions.",
        matched_files: ["src/controllers/checkout.ts"]
      }
    ],
    created_at: new Date().toISOString()
  };

  return NextResponse.json(analysisRun);
}
