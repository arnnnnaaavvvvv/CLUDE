"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitBranch, Plus, Database, CheckCircle2, Clock, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Repository } from "@/lib/types";
import { fetchRepos, connectRepo, fetchIndexStatus } from "@/lib/api";

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState("");
  const [branch, setBranch] = useState("main");

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
    if (!fullName) return;

    try {
      setConnecting(true);
      setError(null);
      await connectRepo({
        github_repo_id: Math.floor(100000 + Math.random() * 900000),
        full_name: fullName,
        default_branch: branch || "main",
        access_token: token || undefined,
      });
      setFullName("");
      setToken("");
      setFormOpen(false);
      await loadRepositories();
    } catch (err: any) {
      setError(err.message || "Failed to connect repository.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Connected Repositories
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage repositories indexed by CLUDE for AI Root-Cause Analysis and Architecture Onboarding.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
        >
          <Plus className="h-4 w-4" />
          Connect Repository
        </button>
      </div>

      {/* Connect Repo Modal / Form */}
      {formOpen && (
        <div className="rounded-xl border border-border bg-surface p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-1">Connect GitHub Repository</h3>
          <p className="text-xs text-gray-400 mb-5">
            Provide the repository full name (e.g. <code className="text-primary font-mono">owner/repo</code>) and optional personal access token for private repositories.
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Repository Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. vercel/next.js"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Default Branch
                </label>
                <input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                GitHub Token (Optional for public, required for private)
              </label>
              <input
                type="password"
                placeholder="ghp_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              />
            </div>

            {error && <div className="text-xs text-danger font-medium">{error}</div>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-surfaceHover hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={connecting}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {connecting ? "Connecting & Indexing..." : "Start Indexing"}
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
          <GitBranch className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-base font-semibold text-white">No repositories connected yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1 mb-5">
            Connect a GitHub repository above to index its git history, AST syntax graph, and vector embeddings.
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
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
                      <GitBranch className="h-5 w-5 text-primary" />
                      <span className="font-bold text-white tracking-tight">{repo.full_name}</span>
                    </div>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Indexed
                      </span>
                    )}
                    {isIndexing && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20 animate-pulse">
                        <Clock className="h-3 w-3" /> Indexing
                      </span>
                    )}
                    {repo.indexing_status === "FAILED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
                        <AlertCircle className="h-3 w-3" /> Failed
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 space-y-1.5 mb-6 font-mono">
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span className="text-gray-200">{repo.default_branch}</span>
                    </div>
                    {repo.last_indexed_sha && (
                      <div className="flex justify-between">
                        <span>HEAD SHA:</span>
                        <span className="text-primary">{repo.last_indexed_sha.substring(0, 7)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Links */}
                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    href={`/rca?repo_id=${repo.id}`}
                    className="flex-1 text-center rounded-lg bg-surfaceHover py-2 text-xs font-semibold text-white hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    Analyze Errors <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    href={`/onboarding?repo_id=${repo.id}`}
                    className="flex-1 text-center rounded-lg bg-surfaceHover py-2 text-xs font-semibold text-gray-300 hover:bg-surfaceHover/80 hover:text-white transition-colors"
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
