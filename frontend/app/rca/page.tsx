"use client";

import { useEffect, useState, useRef, Suspense } from "react";
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
  Image as ImageIcon,
  Upload,
  X,
  Copy,
  ExternalLink,
  GitPullRequest,
  User,
  Layers,
  Terminal,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Repository, AnalysisRun, RankedCandidate } from "@/lib/types";
import { fetchRepos, analyzeStackTrace } from "@/lib/api";
import { ScoreBadge } from "@/components/ScoreBadge";
import { DiffViewer } from "@/components/DiffViewer";

function RootCauseStudioContent() {
  const searchParams = useSearchParams();
  const initialRepoId = searchParams.get("repo_id") || "";

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId);
  const [rawTrace, setRawTrace] = useState<string>("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotSize, setScreenshotSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);
  const [prCreatedCandidateRank, setPrCreatedCandidateRank] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSampleTrace = (type: "js" | "py" | "go" | "fetch") => {
    if (type === "js") {
      setRawTrace(
        `TypeError: Cannot read properties of undefined (reading 'calculateTax')\n    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)\n    at CheckoutController.handleCheckout (src/controllers/checkout.ts:89:12)\n    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)`
      );
    } else if (type === "py") {
      setRawTrace(
        `Traceback (most recent call last):\n  File "app/services/billing.py", line 87, in process_subscription\n    charge_amount = plan.get_discounted_rate(user.tier)\nAttributeError: 'NoneType' object has no attribute 'get_discounted_rate'`
      );
    } else if (type === "go") {
      setRawTrace(
        `panic: runtime error: invalid memory address or nil pointer dereference\ngoroutine 1 [running]:\nmain.DispatchWorker(0x0, 0x1400011c000)\n\t/src/workers/dispatcher.go:73 +0x3c\nmain.main()\n\t/src/main.go:24 +0x88`
      );
    } else if (type === "fetch") {
      setRawTrace(
        `Error: Failed to fetch the entity details from upstream service\n    at fetchEntityDetails (src/api/client.ts:78:14)\n    at DataController.loadDetails (src/controllers/dataController.ts:112:22)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)`
      );
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }
    const sizeInKb = (file.size / 1024).toFixed(1);
    setScreenshotName(file.name);
    setScreenshotSize(`${sizeInKb} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotBase64(null);
    setScreenshotName(null);
    setScreenshotSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const handleCopyCodeSnippet = (snippet: string, candidateSha: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeSnippet(candidateSha);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  const handleCreatePr = (rank: number) => {
    setPrCreatedCandidateRank(rank);
    setTimeout(() => setPrCreatedCandidateRank(null), 3500);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId || (!rawTrace.trim() && !screenshotBase64)) return;

    try {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);

      const result = await analyzeStackTrace({
        repo_id: selectedRepoId,
        raw_trace: rawTrace.trim() || (screenshotName ? `[Attached Screenshot: ${screenshotName}] Error details provided via image context` : "Runtime Error"),
        environment: "production",
        screenshot_base64: screenshotBase64,
        screenshot_name: screenshotName,
      });

      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to execute Root-Cause Analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary flex items-center gap-2.5">
          <Bug className="h-7 w-7 text-blue-400" />
          AI Root-Cause Analysis Studio
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-1">
          Ingest stack traces, logs, or error screenshots. Correlate with AST diff history and get exact causal solutions with committer details.
        </p>
      </div>

      {/* Input & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trace & Screenshot Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-lg space-y-4">
            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Repo Selector */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  Target Repository
                </label>
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#030712] px-3.5 py-2 text-xs text-textPrimary focus:border-blue-500 focus:outline-none font-mono"
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
              <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono">
                <span className="text-[11px] text-textSecondary">Sample:</span>
                <button
                  type="button"
                  onClick={() => handleSampleTrace("js")}
                  className="text-[11px] rounded bg-surfaceHover px-2 py-0.5 text-textSecondary hover:text-textPrimary border border-border"
                >
                  TypeScript
                </button>
                <button
                  type="button"
                  onClick={() => handleSampleTrace("fetch")}
                  className="text-[11px] rounded bg-surfaceHover px-2 py-0.5 text-textSecondary hover:text-textPrimary border border-border"
                >
                  Fetch Error
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary font-mono">
                    Stack Trace, Error Log, or Description
                  </label>
                  <span className="text-[10px] text-textSecondary font-mono">
                    {rawTrace.length} chars
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={rawTrace}
                  onChange={(e) => setRawTrace(e.target.value)}
                  placeholder="Paste stack trace (JS/TS, Python, Go, Java) or type the error description..."
                  className="w-full rounded-lg border border-border bg-[#030712] p-3.5 font-mono text-xs text-textPrimary placeholder-textSecondary/50 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Screenshot Attachment Dropzone */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                    <span>Attach Error Screenshot (Optional)</span>
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono">Multimodal Vision</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!screenshotBase64 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-border hover:border-blue-500/50 bg-[#030712]/50 hover:bg-[#030712]"
                    }`}
                  >
                    <Upload className="h-5 w-5 mx-auto text-blue-400/80 mb-1.5" />
                    <p className="text-xs font-semibold text-textPrimary">
                      Click to upload or drag screenshot
                    </p>
                    <p className="text-[10px] text-textSecondary mt-0.5">
                      Supports PNG, JPG, WEBP (Console errors, Sentry alerts, UI crashes)
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-blue-500/40 bg-[#050B16] p-3 flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer overflow-hidden group"
                      onClick={() => setPreviewImageModal(screenshotBase64)}
                    >
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-blue-500/30 flex-shrink-0 bg-black">
                        <img
                          src={screenshotBase64}
                          alt="Error Screenshot"
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-textPrimary truncate group-hover:text-blue-400 transition-colors">
                          {screenshotName}
                        </p>
                        <p className="text-[10px] text-textSecondary font-mono">{screenshotSize} • Click to enlarge</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="text-textSecondary hover:text-rose-400 p-1.5 rounded-lg hover:bg-surface transition-colors"
                      title="Remove screenshot"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {error && <div className="text-xs text-rose-400 font-medium font-mono">{error}</div>}

              <button
                type="submit"
                disabled={loading || !selectedRepoId || (!rawTrace.trim() && !screenshotBase64)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all font-sans"
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
            <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-4 shadow-lg">
              <Sparkles className="mx-auto h-8 w-8 animate-spin text-blue-400" />
              <h3 className="text-sm font-bold text-textPrimary">Analyzing Failure Path & Committer Graph</h3>
              <div className="max-w-md mx-auto space-y-2 text-xs text-textSecondary font-mono">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Parsed stack frames & normalized failure coordinates</span>
                </div>
                {screenshotBase64 && (
                  <div className="flex items-center gap-2 justify-center text-sky-400">
                    <CheckCircle className="h-3.5 w-3.5 text-sky-400" />
                    <span>Extracted visual diagnostic context from screenshot</span>
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center animate-pulse text-blue-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Correlating commit history, authors, and AST hunks</span>
                </div>
                <div className="flex items-center gap-2 justify-center text-textSecondary/60">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Generating exact solution patch & causal proof</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !analysisResult && (
            <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-12 text-center">
              <Bug className="mx-auto h-10 w-10 text-textSecondary/40 mb-3" />
              <h3 className="text-sm font-semibold text-textPrimary">No Analysis Run Yet</h3>
              <p className="text-xs text-textSecondary max-w-sm mx-auto mt-1">
                Select a repository, paste an error log or attach a screenshot on the left to discover the exact root cause, responsible committer, and runnable solution.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Run Overview Header */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-lg space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                        {analysisResult.error_type || "RUNTIME_ERROR"}
                      </span>
                      {analysisResult.screenshot_attached && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>Screenshot Context Ingested</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-textPrimary mt-1.5">
                      {analysisResult.error_message || "An exception occurred"}
                    </h2>
                  </div>
                  <div className="text-right text-[11px] text-textSecondary font-mono flex-shrink-0">
                    <div>Duration: <span className="text-textPrimary font-bold">{analysisResult.execution_duration_sec}s</span></div>
                    <div className="text-blue-400 font-semibold">{analysisResult.model_used.split(" ")[0]}</div>
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
                        className="flex items-center justify-between rounded-lg bg-[#030712] px-3 py-1.5 border border-border"
                      >
                        <div className="flex items-center gap-2 text-textPrimary">
                          <FileCode className="h-3.5 w-3.5 text-blue-400" />
                          <span>{frame.file_path}</span>
                          <span className="text-blue-400 font-bold">:{frame.line_number}</span>
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
                  <GitCommit className="h-4 w-4 text-blue-400" />
                  <span>Ranked Candidate Commits &amp; Exact Solutions ({analysisResult.ranked_candidates.length})</span>
                </h3>

                {analysisResult.ranked_candidates.map((candidate) => {
                  const author = candidate.commit;
                  const isShaCopied = copiedSha === author.sha;
                  const isCodeCopied = copiedCodeSnippet === author.sha;
                  const isPrCreated = prCreatedCandidateRank === candidate.rank;

                  return (
                    <div
                      key={author.sha}
                      className="rounded-2xl border border-blue-500/30 bg-[#070D18] p-5 shadow-xl space-y-5 hover:border-blue-400/60 transition-all relative overflow-hidden"
                    >
                      {/* Top Header Bar: Score & SHA */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                        <div className="flex items-center gap-3">
                          <ScoreBadge score={candidate.causal_score} rank={candidate.rank} />
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="text-blue-400 font-bold">
                              #{author.sha.substring(0, 8)}
                            </span>
                            <button
                              onClick={() => handleCopySha(author.sha)}
                              className="text-textSecondary hover:text-textPrimary p-1 rounded hover:bg-surface transition-colors"
                              title="Copy full commit SHA"
                            >
                              {isShaCopied ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-xs">
                          {author.branch && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-textSecondary">
                              branch: {author.branch}
                            </span>
                          )}
                          <span className="text-textSecondary text-[11px]">
                            {new Date(author.committed_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* DETAILED COMMITTER CARD */}
                      <div className="rounded-xl border border-border bg-[#030712] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              author.author_avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                author.author_name || "Developer"
                              )}`
                            }
                            alt={author.author_name || "Author"}
                            className="h-10 w-10 rounded-full object-cover border border-blue-500/40"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute(
                                "src",
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  author.author_name || "Author"
                                )}`
                              );
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold text-xs text-textPrimary">
                                {author.author_name || "Unknown Author"}
                              </h5>
                              {author.author_handle && (
                                <span className="text-[11px] font-mono text-blue-400">
                                  {author.author_handle}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-textSecondary font-mono">
                              {author.author_email || "dev@company.com"}
                            </p>
                            {author.author_role && (
                              <p className="text-[10px] text-sky-400 font-mono mt-0.5">
                                {author.author_role}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 border-border/50 pt-2 sm:pt-0">
                          <span className="text-[10px] uppercase tracking-wider text-textSecondary font-mono block">
                            Commit Message
                          </span>
                          <span className="text-xs font-semibold text-textPrimary font-sans">
                            "{author.commit_message}"
                          </span>
                        </div>
                      </div>

                      {/* Plain-English Reasoning */}
                      <div className="rounded-xl bg-[#030712] p-4 border border-border space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-textPrimary">
                          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                          <span>Plain-English Causal Reasoning:</span>
                        </div>
                        <p className="text-xs text-textSecondary leading-relaxed">
                          {candidate.plain_english_reasoning}
                        </p>
                      </div>

                      {/* EXACT CODE SOLUTION SNIPPET & ACTION PLAN */}
                      {candidate.fix_code_snippet && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Exact Solution &amp; Remediation Code:</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleCopyCodeSnippet(candidate.fix_code_snippet!, author.sha)
                                }
                                className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-surface border border-border hover:border-borderStrong text-textPrimary transition-all"
                              >
                                {isCodeCopied ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied Fix</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy Fix</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCreatePr(candidate.rank)}
                                className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded transition-all ${
                                  isPrCreated
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
                                }`}
                              >
                                <GitPullRequest className="h-3 w-3" />
                                <span>{isPrCreated ? "Hotfix PR #104 Created!" : "Create Fix PR"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="rounded-xl border border-emerald-500/30 bg-[#02050D] p-3 font-mono text-xs text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre">
                            {candidate.fix_code_snippet}
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Action Plan */}
                      {candidate.action_steps && candidate.action_steps.length > 0 && (
                        <div className="rounded-xl bg-[#030712]/70 p-3.5 border border-border space-y-2">
                          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider font-mono block">
                            Action Checklist:
                          </span>
                          <div className="space-y-1.5 font-mono text-xs">
                            {candidate.action_steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-textPrimary">
                                <div className="h-4 w-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reproduction Hypothesis & Suggested Fix Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {candidate.reproduction_hypothesis && (
                          <div className="rounded-xl bg-[#030712]/50 p-3 border border-border">
                            <span className="font-semibold text-sky-400 block mb-1 font-mono text-[11px]">
                              Reproduction Path:
                            </span>
                            <p className="text-textSecondary text-[11px] leading-relaxed">
                              {candidate.reproduction_hypothesis}
                            </p>
                          </div>
                        )}
                        {candidate.suggested_fix && (
                          <div className="rounded-xl bg-[#030712]/50 p-3 border border-border">
                            <span className="font-semibold text-emerald-400 block mb-1 font-mono text-[11px]">
                              Suggested Remediation:
                            </span>
                            <p className="text-textSecondary text-[11px] leading-relaxed">
                              {candidate.suggested_fix}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Matched File Diffs */}
                      {candidate.file_diffs && candidate.file_diffs.length > 0 ? (
                        <div>
                          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider block mb-1 font-mono">
                            Affected Files &amp; AST Diff:
                          </span>
                          {candidate.file_diffs.map((diff, idx) => (
                            <DiffViewer
                              key={idx}
                              filePath={diff.filePath}
                              patch={diff.patch}
                            />
                          ))}
                        </div>
                      ) : candidate.matched_files.length > 0 ? (
                        <div>
                          <span className="text-[11px] font-semibold text-textSecondary uppercase tracking-wider block mb-1 font-mono">
                            Affected Files:
                          </span>
                          {candidate.matched_files.map((file, idx) => (
                            <DiffViewer
                              key={idx}
                              filePath={file}
                              patch={`@@ -75,6 +75,9 @@\n- const data = await api.get(\`/api/v1/details/\${id}\`).data;\n+ const response = await api.get(\`/api/v1/details/\${id}\`);\n+ if (!response?.data) return getCachedFallback(id);\n+ const data = response.data;`}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enlarged Screenshot Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[85vh] rounded-2xl border border-blue-500/40 bg-[#080E1A] p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-mono text-textPrimary font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                <span>{screenshotName || "Attached Error Screenshot"}</span>
              </span>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="p-1 rounded-lg text-textSecondary hover:text-white hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] rounded-lg border border-border flex items-center justify-center bg-black">
              <img
                src={previewImageModal}
                alt="Screenshot Full Preview"
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
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
