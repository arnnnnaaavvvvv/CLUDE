"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Layers,
  FileCode,
  ShieldAlert,
  Compass,
  RefreshCw,
} from "lucide-react";
import { Repository, OnboardingWalkthrough } from "@/lib/types";
import { fetchRepos, fetchOnboarding, generateOnboarding } from "@/lib/api";
import { MermaidViewer } from "@/components/MermaidViewer";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const initialRepoId = searchParams.get("repo_id") || "";

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId);
  const [walkthrough, setWalkthrough] = useState<OnboardingWalkthrough | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepos()
      .then((data) => {
        setRepos(data);
        if (!selectedRepoId && data.length > 0) {
          setSelectedRepoId(data[0].id);
        }
      })
      .catch((err) => console.error("Error loading repos:", err));
  }, [selectedRepoId]);

  useEffect(() => {
    if (!selectedRepoId) return;

    setLoading(true);
    setError(null);
    fetchOnboarding(selectedRepoId)
      .then((data) => {
        setWalkthrough(data);
        if (data.sections.length > 0) {
          setSelectedSectionId(data.sections[0].id);
        }
      })
      .catch(() => {
        setWalkthrough(null);
      })
      .finally(() => setLoading(false));
  }, [selectedRepoId]);

  const handleGenerate = async () => {
    if (!selectedRepoId) return;
    try {
      setGenerating(true);
      setError(null);
      const data = await generateOnboarding(selectedRepoId, { force_regenerate: true });
      setWalkthrough(data);
      if (data.sections.length > 0) {
        setSelectedSectionId(data.sections[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate walkthrough.");
    } finally {
      setGenerating(false);
    }
  };

  const activeSection = walkthrough?.sections.find((s) => s.id === selectedSectionId) || walkthrough?.sections[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-blue-400" />
            AI Onboarding Assistant
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Explore system architecture, trace critical business paths, and discover "do-not-touch" danger zones.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-xs text-textPrimary focus:border-blue-500 focus:outline-none font-mono"
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating || !selectedRepoId}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all font-sans"
          >
            {generating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Synthesizing Codebase...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                {walkthrough ? "Regenerate Guide" : "Generate Guide"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <div className="text-xs text-danger font-medium font-mono">{error}</div>}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : !walkthrough ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/30 p-16 text-center">
          <Compass className="mx-auto h-12 w-12 text-textSecondary/40 mb-3" />
          <h3 className="text-base font-bold text-textPrimary">No Onboarding Walkthrough Generated</h3>
          <p className="text-xs text-textSecondary max-w-md mx-auto mt-1 mb-6">
            Let CLUDE traverse the repository AST, compute churn frequencies, and synthesize a comprehensive developer guide.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <Sparkles className="h-4 w-4" />
            Generate Architectural Guide
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Architecture Diagram Box */}
          {walkthrough.system_diagram_mermaid && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-400" />
                  System Architecture Topology
                </h3>
                <span className="text-[11px] text-textSecondary font-mono">Auto-generated Mermaid Graph</span>
              </div>
              <MermaidViewer chart={walkthrough.system_diagram_mermaid} />
            </div>
          )}

          {/* Chapter Navigation & Reader Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Chapters Navigation */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary block mb-3 font-mono">
                Walkthrough Chapters
              </span>

              <div className="space-y-2">
                {walkthrough.sections.map((sec) => {
                  const isSelected = sec.id === (activeSection?.id || "");
                  const isDanger = sec.section_type === "DANGER_ZONE";

                  return (
                    <button
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`w-full text-left rounded-xl p-4 transition-all border ${
                        isSelected
                          ? "bg-surfaceHover border-blue-500 text-textPrimary shadow-md"
                          : "bg-surface border-border text-textSecondary hover:text-textPrimary hover:bg-surfaceHover/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {isDanger ? (
                            <ShieldAlert className="h-4 w-4 text-rose-400" />
                          ) : (
                            <FileCode className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="font-semibold text-xs text-textPrimary">{sec.title}</span>
                        </div>
                        {sec.risk_level && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${
                              sec.risk_level === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : sec.risk_level === "MEDIUM"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}
                          >
                            {sec.risk_level}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-textSecondary line-clamp-1 font-mono">
                        {sec.section_type.replace("_", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Section Detail Reader */}
            <div className="lg:col-span-8">
              {activeSection && (
                <div className="rounded-2xl border border-border bg-surface p-7 shadow-lg space-y-6">
                  {/* Section Title & Header */}
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center gap-2 text-[11px] text-blue-400 font-semibold uppercase tracking-wider mb-1 font-mono">
                      <span>{activeSection.section_type.replace("_", " ")}</span>
                    </div>
                    <h2 className="text-xl font-bold text-textPrimary tracking-tight">
                      {activeSection.title}
                    </h2>
                  </div>

                  {/* Section Content Markdown */}
                  <div className="prose prose-invert max-w-none text-xs text-textSecondary leading-relaxed whitespace-pre-line">
                    {activeSection.content_markdown}
                  </div>

                  {/* Referenced Files List */}
                  {activeSection.referenced_files && activeSection.referenced_files.length > 0 && (
                    <div className="pt-6 border-t border-border space-y-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-textSecondary block font-mono">
                        Referenced Repository Files
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeSection.referenced_files.map((file, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#030712] px-3 py-1.5 font-mono text-xs text-textPrimary border border-border"
                          >
                            <FileCode className="h-3.5 w-3.5 text-blue-400" />
                            <span>{typeof file === "string" ? file : file.file_path || JSON.stringify(file)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-textSecondary font-mono text-xs">Loading Onboarding Guide...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
