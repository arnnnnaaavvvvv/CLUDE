"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  AlertTriangle,
  Layers,
  FileCode,
  ShieldAlert,
  Compass,
  CheckCircle2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Repository, OnboardingWalkthrough, WalkthroughSection } from "@/lib/types";
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

  // Load repositories on mount
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

  // Load Walkthrough when repo changes
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
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            AI Onboarding Assistant
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Explore system architecture, trace critical business paths, and discover "do-not-touch" danger zones.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-white focus:border-primary focus:outline-none"
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Synthesizing Codebase...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {walkthrough ? "Regenerate Guide" : "Generate Onboarding Guide"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-danger font-medium">{error}</div>}

      {/* Main Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !walkthrough ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/30 p-16 text-center">
          <Compass className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-base font-bold text-white">No Onboarding Walkthrough Generated</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-6">
            Let CLUDE traverse the repository AST, compute churn frequencies, and synthesize a comprehensive developer guide.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
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
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  System Architecture Topology
                </h3>
                <span className="text-xs text-gray-500 font-mono">Auto-generated Mermaid Graph</span>
              </div>
              <MermaidViewer chart={walkthrough.system_diagram_mermaid} />
            </div>
          )}

          {/* Chapter Navigation & Reader Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Chapters Navigation */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3">
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
                          ? "bg-surfaceHover border-primary text-white shadow-md"
                          : "bg-surface border-border text-gray-400 hover:text-white hover:bg-surfaceHover/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {isDanger ? (
                            <ShieldAlert className="h-4 w-4 text-rose-400" />
                          ) : (
                            <FileCode className="h-4 w-4 text-primary" />
                          )}
                          <span className="font-semibold text-sm">{sec.title}</span>
                        </div>
                        {sec.risk_level && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                      <span className="text-xs text-gray-500 line-clamp-1">
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
                <div className="rounded-xl border border-border bg-surface p-7 shadow-lg space-y-6">
                  {/* Section Title & Header */}
                  <div className="border-b border-border pb-4">
                    <div className="flex items-center gap-2 text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                      <span>{activeSection.section_type.replace("_", " ")}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {activeSection.title}
                    </h2>
                  </div>

                  {/* Section Content Markdown */}
                  <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {activeSection.content_markdown}
                  </div>

                  {/* Referenced Files List */}
                  {activeSection.referenced_files && activeSection.referenced_files.length > 0 && (
                    <div className="pt-6 border-t border-border space-y-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                        Referenced Repository Files
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeSection.referenced_files.map((file, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 font-mono text-xs text-gray-300 border border-border"
                          >
                            <FileCode className="h-3.5 w-3.5 text-primary" />
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
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading Onboarding Guide...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
