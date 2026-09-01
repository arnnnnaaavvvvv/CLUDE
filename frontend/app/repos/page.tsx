"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Globe,
  Github,
  Network,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { Repository } from "@/lib/types";
import { fetchRepos, connectRepo } from "@/lib/api";
import { GitHubConnectModal } from "@/components/GitHubConnectModal";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [gitHubModalOpen, setGitHubModalOpen] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [repoInput, setRepoInput] = useState("");
  const [branch, setBranch] = useState("main");

  const parseRepoName = (input: string): string => {
    let clean = input.trim();
    clean = clean.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "");
    clean = clean.replace(/^git@github\.com:/i, "");
    clean = clean.replace(/\.git$/i, "");
    clean = clean.replace(/^\/+|\/+$/g, "");
    return clean;
  };

  const loadRepositories = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const data = await fetchRepos();
      setRepos(data || []);
    } catch (err: any) {
      console.error(err);
      setPageError("Failed to sync repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepositories();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFullName = parseRepoName(repoInput);

    if (!cleanFullName || !cleanFullName.includes("/")) {
      setFormError("Please enter a valid GitHub repository URL or format like 'owner/repo'");
      return;
    }

    try {
      setConnecting(true);
      setFormError(null);
      await connectRepo({
        github_repo_id: Math.floor(100000 + Math.random() * 900000),
        full_name: cleanFullName,
        default_branch: branch || "main",
      });
      setRepoInput("");
      setFormOpen(false);
      await loadRepositories();
    } catch (err: any) {
      setFormError(err.message || "Failed to connect repository.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary flex items-center gap-2.5">
            <GitBranch className="h-7 w-7 text-blue-400" />
            Connected Repositories
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Connect your GitHub profile or repository URLs to index git history and generate AI root-cause diagnostics & architecture guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setGitHubModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-surface hover:bg-surfaceHover border border-blue-500/30 px-3.5 py-2.5 text-xs font-semibold text-textPrimary transition-all shadow-sm"
          >
            <Github className="h-4 w-4 text-blue-400" />
            <span>Connect GitHub</span>
          </button>

          <button
            onClick={() => {
              setFormOpen(!formOpen);
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Repo Link</span>
          </button>
        </div>
      </div>

      {pageError && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-yellow-400 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{pageError}</span>
          </div>
          <button
            onClick={() => loadRepositories()}
            className="text-[11px] underline hover:text-white font-mono"
          >
            Retry
          </button>
        </div>
      )}

      {/* Connect Repo Modal / Form */}
      {formOpen && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" />
              Connect Single Repository URL
            </h3>
            <span className="text-[11px] text-textSecondary font-mono">No access tokens required</span>
          </div>
          <p className="text-xs text-textSecondary mb-5">
            Paste any public repository URL (e.g. <code className="text-blue-400 font-mono">https://github.com/owner/repo</code>) or shorthand (<code className="text-blue-400 font-mono">owner/repo</code>).
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  GitHub Repository URL or Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo or owner/repo"
                    value={repoInput}
                    onChange={(e) => {
                      setRepoInput(e.target.value);
                      setFormError(null);
                    }}
                    required
                    className="w-full rounded-lg border border-border bg-[#030712] px-3.5 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  Default Branch
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-[#030712] px-3.5 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 focus:border-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs text-danger font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-textSecondary hover:bg-surfaceHover hover:text-textPrimary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={connecting || !repoInput.trim()}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Connecting & Indexing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Start Indexing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Repositories List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : repos.length === 0 ? (
        /* Empty State: Premium Connect GitHub Gate */
        <div className="relative rounded-3xl border border-blue-500/20 bg-gradient-to-b from-surface/80 via-[#0B0F19] to-surface/40 p-8 sm:p-14 shadow-2xl overflow-hidden text-center space-y-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative space-y-3 max-w-xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-blue-400 shadow-xl shadow-blue-500/10">
              <Github className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary">
              No Repositories Connected
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              Connect your GitHub account to import and index your repositories, or paste any public repository link to get started.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl border border-border bg-[#030712]/60 p-5 space-y-2">
              <Network className="h-5 w-5 text-blue-400" />
              <h4 className="text-xs font-bold text-textPrimary">Git History Indexing</h4>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                Indexes commits, authors, and structural diffs into high-dimensional vector embeddings.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[#030712]/60 p-5 space-y-2">
              <Cpu className="h-5 w-5 text-emerald-400" />
              <h4 className="text-xs font-bold text-textPrimary">AI Causal Diagnostics</h4>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                Pinpoints the exact commit that broke production with causal scoring.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[#030712]/60 p-5 space-y-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" />
              <h4 className="text-xs font-bold text-textPrimary">Architecture Onboarding</h4>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                Synthesizes interactive Mermaid system graphs and deep-dive developer runbooks.
              </p>
            </div>
          </div>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setGitHubModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-7 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              <Github className="h-4 w-4" />
              <span>Connect GitHub Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setFormOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-surface hover:bg-surfaceHover border border-border px-6 py-3.5 text-xs font-semibold text-textSecondary hover:text-textPrimary transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Paste Single Repo URL</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => {
            const isCompleted = repo.indexing_status === "COMPLETED";
            const isIndexing = repo.indexing_status === "INDEXING" || repo.indexing_status === "PENDING";

            return (
              <div
                key={repo.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="font-bold text-sm text-textPrimary tracking-tight break-all font-mono">{repo.full_name}</span>
                    </div>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 whitespace-nowrap font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Indexed
                      </span>
                    )}
                    {isIndexing && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20 animate-pulse whitespace-nowrap font-mono">
                        <Clock className="h-3 w-3" /> Indexing
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-textSecondary space-y-1.5 mb-6 font-mono">
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span className="text-textPrimary">{repo.default_branch}</span>
                    </div>
                    {repo.last_indexed_sha && (
                      <div className="flex justify-between">
                        <span>HEAD SHA:</span>
                        <span className="text-blue-400 font-bold">{repo.last_indexed_sha.substring(0, 7)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2 font-mono">
                  <Link
                    href={`/rca?repo_id=${repo.id}`}
                    className="flex-1 text-center rounded-lg bg-surfaceHover py-2 text-[11px] font-semibold text-textPrimary hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    Diagnose Trace <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/onboarding?repo_id=${repo.id}`}
                    className="flex-1 text-center rounded-lg bg-surfaceHover py-2 text-[11px] font-semibold text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    View Guide
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={gitHubModalOpen}
        onClose={() => {
          setGitHubModalOpen(false);
          loadRepositories();
        }}
        onConnected={loadRepositories}
      />
    </div>
  );
}
