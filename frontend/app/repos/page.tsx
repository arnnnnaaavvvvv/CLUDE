"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, Plus, CheckCircle2, Clock, AlertCircle, ArrowRight, RefreshCw, Sparkles, Globe, Shield } from "lucide-react";
import { Repository } from "@/lib/types";
import { fetchRepos, connectRepo } from "@/lib/api";

const PRESET_REPOS = [
  "facebook/react",
  "vercel/next.js",
  "fastapi/fastapi",
  "tailwindlabs/tailwindcss",
];

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const data = await fetchRepos();
      setRepos(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load repositories from CLUDE API.");
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
      setError("Please enter a valid GitHub repository URL or format like 'owner/repo'");
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      await connectRepo({
        github_repo_id: Math.floor(100000 + Math.random() * 900000),
        full_name: cleanFullName,
        default_branch: branch || "main",
      });
      setRepoInput("");
      setFormOpen(false);
      await loadRepositories();
    } catch (err: any) {
      setError(err.message || "Failed to connect repository.");
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
            <GitBranch className="h-7 w-7 text-primary" />
            Connected Repositories
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Connect any GitHub repository link to index git history and generate AI root-cause diagnostics & architecture guides.
          </p>
        </div>
        <button
          onClick={() => {
            setFormOpen(!formOpen);
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Repository Link
        </button>
      </div>

      {/* Connect Repo Modal / Form */}
      {formOpen && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Connect GitHub Repository
            </h3>
            <span className="text-[11px] text-textSecondary font-mono">No personal access tokens required</span>
          </div>
          <p className="text-xs text-textSecondary mb-5">
            Paste any public repository URL (e.g. <code className="text-primary font-mono">https://github.com/facebook/react</code>) or shorthand name (<code className="text-primary font-mono">owner/repo</code>).
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
                      setError(null);
                    }}
                    required
                    className="w-full rounded-lg border border-border bg-[#0A0B0D] px-3.5 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 focus:border-primary focus:outline-none font-mono"
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
                  className="w-full rounded-lg border border-border bg-[#0A0B0D] px-3.5 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 focus:border-primary focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
              <span className="text-[11px] text-textSecondary">Quick presets:</span>
              {PRESET_REPOS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setRepoInput(`https://github.com/${preset}`);
                    setError(null);
                  }}
                  className="text-[11px] rounded bg-surfaceHover px-2.5 py-1 text-textSecondary hover:text-textPrimary hover:bg-primary/20 hover:border-primary/40 border border-border transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs text-danger font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
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
                className="rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
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
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : repos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/30 p-12 text-center">
          <GitBranch className="mx-auto h-12 w-12 text-textSecondary/50 mb-3" />
          <h3 className="text-base font-semibold text-textPrimary">No repositories connected yet</h3>
          <p className="text-xs text-textSecondary max-w-sm mx-auto mt-1 mb-5">
            Paste a GitHub repository link above to index its git history, AST syntax graph, and vector embeddings.
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Connect Your First Repo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => {
            const isCompleted = repo.indexing_status === "COMPLETED";
            const isIndexing = repo.indexing_status === "INDEXING" || repo.indexing_status === "PENDING";

            return (
              <div
                key={repo.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-bold text-sm text-textPrimary tracking-tight break-all font-mono">{repo.full_name}</span>
                    </div>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 whitespace-nowrap font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Indexed
                      </span>
                    )}
                    {isIndexing && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20 animate-pulse whitespace-nowrap font-mono">
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
                        <span className="text-primary font-bold">{repo.last_indexed_sha.substring(0, 7)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2 font-mono">
                  <Link
                    href={`/rca?repo_id=${repo.id}`}
                    className="flex-1 text-center rounded-lg bg-surfaceHover py-2 text-[11px] font-semibold text-textPrimary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1"
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
    </div>
  );
}
