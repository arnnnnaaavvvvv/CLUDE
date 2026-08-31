"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bug,
  Sparkles,
  GitCommit,
  Clock,
  CheckCircle,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Repository, AnalysisRun } from "@/lib/types";
import { fetchRepos, analyzeStackTrace } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { DiffViewer } from "@/components/DiffViewer";

function RootCauseStudioContent() {
  const searchParams = useSearchParams();
  const initialRepoId = searchParams.get("repo_id") || "";

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId);
  const [rawTrace, setRawTrace] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load repositories on mount
  useEffect(() => {
    fetchRepos()
      .then((data) => {
        setRepos(data);
        if (!selectedRepoId && data.length > 0) {
          setSelectedRepoId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching repos:", err));
  }, [selectedRepoId]);

  const handleSampleTrace = (type: "js" | "py" | "go") => {
    if (type === "js") {
      setRawTrace(
        `TypeError: Cannot read properties of undefined (reading 'calculateTax')
    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)
    at CheckoutController.handleCheckout (src/controllers/checkout.ts:89:12)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)`
      );
    } else if (type === "py") {
      setRawTrace(
        `Traceback (most recent call last):
  File "app/services/billing.py", line 87, in process_subscription
    charge_amount = plan.get_discounted_rate(user.tier)
AttributeError: 'NoneType' object has no attribute 'get_discounted_rate'`
      );
    } else if (type === "go") {
      setRawTrace(
        `panic: runtime error: invalid memory address or nil pointer dereference
goroutine 1 [running]:
main.DispatchWorker(0x0, 0x1400011c000)
\t/src/workers/dispatcher.go:73 +0x3c
main.main()
\t/src/main.go:24 +0x88`
      );
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId || !rawTrace.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);

      const result = await analyzeStackTrace({
        repo_id: selectedRepoId,
        raw_trace: rawTrace,
        environment: "production",
      });

      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to execute Root-Cause Analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary flex items-center gap-2.5">
          <Bug className="h-7 w-7 text-primary" />
          AI Root-Cause Analysis Studio
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Ingest stack traces or logs, correlate against git commit history, and rank candidate commits with LLM causal reasoning.
        </p>
      </div>

      {/* Input & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Trace Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-lg">
            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Repo Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  Target Repository
                </label>
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#0A0B0D] px-3.5 py-2 text-xs text-textPrimary focus:border-primary focus:outline-none font-mono"
                >
                  {repos.length === 0 ? (
                    <option value="">No repositories connected</option>
                  ) : (
                    repos.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.full_name} ({r.default_branch})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Sample Buttons */}
              <div className="flex items-center gap-2 pt-1 font-mono">
                <span className="text-[11px] text-textSecondary">Load Sample:</span>
                <button
                  type="button"
                  onClick={() => handleSampleTrace("js")}
                  className="text-[11px] rounded bg-surfaceHover px-2 py-0.5 text-textSecondary hover:text-textPrimary border border-border"
                >
                  TypeScript
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleTrace("py")}
                  className="text-[11px] rounded bg-surfaceHover px-2 py-0.5 text-textSecondary hover:text-textPrimary border border-border"
                >
                  Python
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleTrace("go")}
                  className="text-[11px] rounded bg-surfaceHover px-2 py-0.5 text-textSecondary hover:text-textPrimary border border-border"
                >
                  Go Panic
                </button>
              </div>

              {/* Stack Trace Textarea */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  Stack Trace or Error Log
                </label>
                <textarea
                  rows={9}
                  value={rawTrace}
                  onChange={(e) => setRawTrace(e.target.value)}
                  placeholder="Paste stack trace (JS/TS, Python, Go, Java)..."
                  required
                  className="w-full rounded-lg border border-border bg-[#0A0B0D] p-3.5 font-mono text-xs text-textPrimary placeholder-textSecondary/50 focus:border-primary focus:outline-none leading-relaxed"
                />
              </div>

              {error && <div className="text-xs text-danger font-medium font-mono">{error}</div>}

              <button
                type="submit"
                disabled={loading || !selectedRepoId || !rawTrace.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all font-sans"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Correlating Git History & Reasoning...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Run AI Root-Cause Analysis
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Reasoning & Ranked Results */}
        <div className="lg:col-span-7 space-y-6">
          {loading && (
            <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-4 shadow-lg">
              <Sparkles className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h3 className="text-sm font-bold text-textPrimary">Analyzing Failure Path</h3>
              <div className="max-w-md mx-auto space-y-2 text-xs text-textSecondary font-mono">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                  <span>Parsed stack frames & normalized coordinates</span>
                </div>
                <div className="flex items-center gap-2 justify-center animate-pulse text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Traversing commit graph & diff hunks</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-textSecondary/60">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Evaluating causal likelihood with Claude 3.5 Sonnet</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !analysisResult && (
            <div className="rounded-xl border border-dashed border-border bg-surface/30 p-12 text-center">
              <Bug className="mx-auto h-10 w-10 text-textSecondary/40 mb-3" />
              <h3 className="text-sm font-semibold text-textPrimary">No Analysis Run Yet</h3>
              <p className="text-xs text-textSecondary max-w-sm mx-auto mt-1">
                Select a repository and paste an error log on the left to discover the root-cause commit.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Run Overview Header */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-lg">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4 mb-4">
                  <div>
                    <span className="text-[11px] uppercase font-mono tracking-wider text-rose-400 font-bold">
                      {analysisResult.error_type || "Runtime Error"}
                    </span>
                    <h2 className="text-base font-bold text-textPrimary mt-0.5">
                      {analysisResult.error_message || "An exception occurred"}
                    </h2>
                  </div>
                  <div className="text-right text-[11px] text-textSecondary font-mono">
                    <div>Duration: {analysisResult.execution_duration_sec}s</div>
                    <div className="text-primary font-semibold">{analysisResult.model_used}</div>
                  </div>
                </div>

                {/* Parsed Frames List */}
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-2 font-mono">
                    Failing Stack Coordinates
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {analysisResult.parsed_frames.map((frame, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-[#0A0B0D] px-3 py-1.5 border border-border"
                      >
                        <div className="flex items-center gap-2 text-textPrimary">
                          <FileCode className="h-3.5 w-3.5 text-primary" />
                          <span>{frame.file_path}</span>
                          <span className="text-primary font-bold">:{frame.line_number}</span>
                        </div>
                        <span className="text-textSecondary text-[11px]">
                          {frame.function_name || "global"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ranked Candidates */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-primary" />
                  Ranked Candidate Commits ({analysisResult.ranked_candidates.length})
                </h3>

                {analysisResult.ranked_candidates.map((candidate) => (
                  <div
                    key={candidate.commit.sha}
                    className="rounded-xl border border-border bg-surface p-5 shadow-md space-y-4 hover:border-primary/40 transition-all"
                  >
                    {/* Header: Score & Commit Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-3">
                        <ScoreBadge score={candidate.causal_score} rank={candidate.rank} />
                        <span className="font-mono text-xs text-primary font-bold">
                          #{candidate.commit.sha.substring(0, 8)}
                        </span>
                      </div>
                      <div className="text-xs text-textSecondary font-mono">
                        <span>{candidate.commit.author_name}</span> &bull;{" "}
                        <span>{new Date(candidate.commit.committed_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Commit Message */}
                    <div className="text-xs font-semibold text-textPrimary">
                      "{candidate.commit.commit_message}"
                    </div>

                    {/* Plain-English Reasoning */}
                    <div className="rounded-lg bg-[#0A0B0D] p-4 border border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-textPrimary">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>Plain-English Reasoning:</span>
                      </div>
                      <p className="text-xs text-textSecondary leading-relaxed">
                        {candidate.plain_english_reasoning}
                      </p>
                    </div>

                    {/* Reproduction Hypothesis & Fix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {candidate.reproduction_hypothesis && (
                        <div className="rounded bg-[#0A0B0D]/50 p-3 border border-border">
                          <span className="font-semibold text-amber-400 block mb-1 font-mono text-[11px]">
                            Reproduction Path:
                          </span>
                          <p className="text-textSecondary text-[11px]">{candidate.reproduction_hypothesis}</p>
                        </div>
                      )}
                      {candidate.suggested_fix && (
                        <div className="rounded bg-[#0A0B0D]/50 p-3 border border-border">
                          <span className="font-semibold text-emerald-400 block mb-1 font-mono text-[11px]">
                            Suggested Remediation:
                          </span>
                          <p className="text-textSecondary text-[11px]">{candidate.suggested_fix}</p>
                        </div>
                      )}
                    </div>

                    {/* Matched File Diffs */}
                    {candidate.matched_files.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider block mb-1 font-mono">
                          Affected Files:
                        </span>
                        {candidate.matched_files.map((file, idx) => (
                          <DiffViewer
                            key={idx}
                            filePath={file}
                            patch={`@@ -140,5 +140,6 @@\n- const tax = this.calculateTax(order);\n+ if (!this.taxProvider) {\n+   throw new TypeError("Cannot read properties of undefined (reading 'calculateTax')");\n+ }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RootCauseStudio() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-textSecondary font-mono text-xs">Loading Root-Cause Studio...</div>}>
      <RootCauseStudioContent />
    </Suspense>
  );
}
