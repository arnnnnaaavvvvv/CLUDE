"use client";

import React, { useState, useEffect } from "react";
import {
  Github,
  CheckCircle2,
  X,
  Search,
  Lock,
  Globe,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Star,
  GitFork,
} from "lucide-react";
import { Repository } from "@/lib/types";
import { connectRepo, fetchRepos } from "@/lib/api";

interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

interface GitHubUserProfile {
  username: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export function GitHubConnectModal({ isOpen, onClose, onConnected }: GitHubConnectModalProps) {
  const [step, setStep] = useState<"username" | "select_mode" | "custom_select" | "connecting">("username");
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<GitHubUserProfile | null>(null);
  const [fetchedRepos, setFetchedRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepoNames, setSelectedRepoNames] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Check existing connection
      try {
        const storedProfile = localStorage.getItem("clude_github_profile");
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUsernameInput(profile.username);
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.trim().replace(/^@/, "").replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, "").replace(/\/+$/, "");
    if (!cleanUsername) {
      setError("Please enter a valid GitHub username.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`);
      if (!userRes.ok) {
        if (userRes.status === 404) {
          throw new Error(`GitHub user or organization '${cleanUsername}' was not found.`);
        }
        throw new Error("Could not fetch user from GitHub API. Please check your network.");
      }
      const userData = await userRes.json();
      const profile: GitHubUserProfile = {
        username: userData.login,
        avatar_url: userData.avatar_url,
        name: userData.name,
        bio: userData.bio,
        public_repos: userData.public_repos || 0,
      };
      setUserProfile(profile);

      // Fetch public repos
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?per_page=100&sort=updated`);
      let reposData: any[] = [];
      if (reposRes.ok) {
        reposData = await reposRes.json();
      }

      const formattedRepos: GitHubRepoItem[] = reposData.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        html_url: r.html_url,
        default_branch: r.default_branch || "main",
        private: r.private || false,
        stargazers_count: r.stargazers_count || 0,
        language: r.language,
        updated_at: r.updated_at,
      }));

      setFetchedRepos(formattedRepos);
      setSelectedRepoNames(new Set(formattedRepos.map((r) => r.full_name)));
      setStep("select_mode");
    } catch (err: any) {
      setError(err.message || "Failed to load GitHub account.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAll = async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      setError(null);
      setStep("connecting");

      // Save profile
      localStorage.setItem("clude_github_profile", JSON.stringify(userProfile));

      // Connect all repos
      for (const repo of fetchedRepos) {
        await connectRepo({
          github_repo_id: repo.id,
          full_name: repo.full_name,
          default_branch: repo.default_branch,
          is_private: repo.private,
        });
      }

      if (onConnected) onConnected();
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to connect repositories.");
      setStep("select_mode");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSelected = async () => {
    if (!userProfile) return;
    if (selectedRepoNames.size === 0) {
      setError("Please select at least one repository to connect.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep("connecting");

      // Save profile
      localStorage.setItem("clude_github_profile", JSON.stringify(userProfile));

      const reposToConnect = fetchedRepos.filter((r) => selectedRepoNames.has(r.full_name));

      for (const repo of reposToConnect) {
        await connectRepo({
          github_repo_id: repo.id,
          full_name: repo.full_name,
          default_branch: repo.default_branch,
          is_private: repo.private,
        });
      }

      if (onConnected) onConnected();
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to connect selected repositories.");
      setStep("custom_select");
    } finally {
      setLoading(false);
    }
  };

  const toggleRepoSelection = (fullName: string) => {
    setSelectedRepoNames((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });
  };

  const filteredRepos = fetchedRepos.filter((r) =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.language && r.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-[#0B0F19] p-6 sm:p-8 shadow-2xl overflow-hidden font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-textSecondary hover:text-textPrimary bg-surface p-1.5 rounded-lg border border-border transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* STEP 1: Enter Username */}
        {step === "username" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Github className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-textPrimary tracking-tight">Connect GitHub Account</h2>
                <p className="text-xs text-textSecondary mt-0.5">
                  Link your public GitHub profile to import, index, and explore your repositories with AI root-cause diagnostics.
                </p>
              </div>
            </div>

            <form onSubmit={handleFetchUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-textSecondary mb-1.5 font-mono">
                  GitHub Username or Handle <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-textSecondary/60 font-mono text-xs">github.com/</span>
                  <input
                    type="text"
                    placeholder="arnnnnaaavvvvv"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setError(null);
                    }}
                    required
                    className="w-full rounded-xl border border-border bg-[#030712] pl-24 pr-4 py-2.5 text-xs text-textPrimary placeholder-textSecondary/40 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs text-danger font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="rounded-xl border border-border bg-surface/40 p-3.5 flex items-center gap-3 text-xs text-textSecondary">
                <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  No passwords or personal access tokens required. Reads public repository metadata via the official GitHub API.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-textSecondary hover:bg-surface hover:text-textPrimary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !usernameInput.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Checking GitHub Profile...
                    </>
                  ) : (
                    <>
                      <Github className="h-3.5 w-3.5" />
                      Continue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Choose Permission / Display Mode */}
        {step === "select_mode" && userProfile && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* User Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.username}
                  className="h-11 w-11 rounded-full border border-blue-500/40 object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-textPrimary">{userProfile.name || userProfile.username}</h3>
                    <span className="font-mono text-[11px] text-blue-400">@{userProfile.username}</span>
                  </div>
                  <p className="text-[11px] text-textSecondary line-clamp-1">{userProfile.bio || `${fetchedRepos.length} public repositories detected`}</p>
                </div>
              </div>
              <button
                onClick={() => setStep("username")}
                className="text-[11px] text-textSecondary hover:text-textPrimary underline font-mono"
              >
                Change
              </button>
            </div>

            {/* Permission Question */}
            <div>
              <h4 className="text-sm font-bold text-textPrimary mb-1">Select Repository Permission</h4>
              <p className="text-xs text-textSecondary">
                Choose how you want CLUDE to display and index repositories from your GitHub account:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: All Repos */}
              <button
                type="button"
                onClick={handleConnectAll}
                className="group text-left rounded-xl border border-border bg-surface p-5 hover:border-blue-500 hover:bg-surfaceHover transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {fetchedRepos.length} Repos
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-textPrimary group-hover:text-blue-400 transition-colors">
                    Display All Repositories
                  </h5>
                  <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">
                    Automatically import and index all public repositories under @{userProfile.username}.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 font-mono">
                  Connect All &rarr;
                </span>
              </button>

              {/* Option B: Specific Repositories */}
              <button
                type="button"
                onClick={() => setStep("custom_select")}
                className="group text-left rounded-xl border border-border bg-surface p-5 hover:border-blue-500 hover:bg-surfaceHover transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                      <FolderGit2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Custom Granular
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-textPrimary group-hover:text-emerald-400 transition-colors">
                    Select Specific Repositories
                  </h5>
                  <p className="text-[11px] text-textSecondary mt-1 leading-relaxed">
                    Manually choose which specific repositories to import and make visible in CLUDE.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 font-mono">
                  Choose Specific &rarr;
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Custom Repository Multi-Select */}
        {step === "custom_select" && userProfile && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-textPrimary">Select Repositories to Connect</h3>
                <p className="text-[11px] text-textSecondary">
                  Selected <span className="font-bold text-blue-400 font-mono">{selectedRepoNames.size}</span> of{" "}
                  <span className="font-bold text-textPrimary font-mono">{fetchedRepos.length}</span> repositories
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRepoNames(new Set(fetchedRepos.map((r) => r.full_name)))}
                  className="text-[10px] font-mono text-blue-400 hover:text-white bg-surface px-2 py-1 rounded border border-border"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRepoNames(new Set())}
                  className="text-[10px] font-mono text-textSecondary hover:text-textPrimary bg-surface px-2 py-1 rounded border border-border"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-textSecondary/50" />
              <input
                type="text"
                placeholder="Filter repositories by name, language, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-[#030712] pl-9 pr-4 py-2 text-xs text-textPrimary placeholder-textSecondary/40 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>

            {/* Repo Checklist Scroll Area */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-border/40">
              {filteredRepos.length === 0 ? (
                <div className="py-8 text-center text-xs text-textSecondary font-mono">
                  No repositories match "{searchQuery}"
                </div>
              ) : (
                filteredRepos.map((repo) => {
                  const isChecked = selectedRepoNames.has(repo.full_name);
                  return (
                    <div
                      key={repo.id}
                      onClick={() => toggleRepoSelection(repo.full_name)}
                      className={`pt-2.5 pb-2 px-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-blue-500/10 border-blue-500/40 text-textPrimary"
                          : "bg-surface/40 border-border/60 text-textSecondary hover:bg-surface/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-1 h-3.5 w-3.5 rounded border-border text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-textPrimary truncate">{repo.full_name}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 text-[10px] font-mono text-textSecondary">
                            {repo.language && (
                              <span className="bg-surface px-1.5 py-0.5 rounded border border-border text-blue-300">
                                {repo.language}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 text-amber-400" />
                              {repo.stargazers_count}
                            </span>
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-[11px] text-textSecondary truncate mt-0.5">{repo.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-2.5 text-xs text-danger font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setStep("select_mode")}
                className="text-xs text-textSecondary hover:text-textPrimary font-mono"
              >
                &larr; Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-xs text-textSecondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConnectSelected}
                  disabled={loading || selectedRepoNames.size === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-50 font-sans"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Connect {selectedRepoNames.size} Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Connecting Progress Indicator */}
        {step === "connecting" && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="mx-auto h-10 w-10 text-blue-400 animate-spin" />
            <h3 className="text-base font-bold text-textPrimary">Syncing & Indexing GitHub Repositories...</h3>
            <p className="text-xs text-textSecondary max-w-sm mx-auto font-mono">
              Persisting repository AST anchors, branch coordinates, and registering metadata with CLUDE.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
