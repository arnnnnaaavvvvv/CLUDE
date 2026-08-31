"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bug,
  BookOpen,
  GitBranch,
  Terminal,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Layers,
  Database,
  CheckCircle2,
  Code2,
  Clock,
  ChevronRight,
  Github,
  Search,
  Cpu,
  Lock,
} from "lucide-react";
import { HeroTerminalDemo } from "@/components/HeroTerminalDemo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"rca" | "onboarding">("rca");

  return (
    <div className="space-y-24 pb-16 font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 text-center space-y-8 max-w-5xl mx-auto">
        {/* Background Grid Accent */}
        <div className="absolute inset-0 bg-radial-glow -z-10 pointer-events-none" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-mono text-textSecondary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-textPrimary font-medium">CLUDE 1.0</span>
          <span className="text-borderStrong">•</span>
          <span>Causal Incident Attribution & Architecture Synthesis</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-textPrimary leading-[1.1] max-w-4xl mx-auto">
          Stop bisecting commits.{" "}
          <span className="text-primary block mt-1 sm:inline">Find the exact diff that broke production</span> in seconds.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed font-sans">
          CLUDE ingests stack traces, correlates them against your repository’s AST and git history, and uses LLM causal reasoning to rank candidate commits with plain-English proof—while generating guided architecture walkthroughs for day-one engineers.
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-sans">
          <Link
            href="/rca"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            <Bug className="h-4 w-4" />
            <span>Launch Root-Cause Studio</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/onboarding"
            className="flex items-center gap-2 rounded-lg bg-surface hover:bg-surfaceHover px-5 py-3 text-sm font-medium text-textPrimary border border-border hover:border-borderStrong transition-all"
          >
            <BookOpen className="h-4 w-4 text-textSecondary" />
            <span>Explore Onboarding Guide</span>
          </Link>
        </div>

        {/* HERO INTERACTIVE TERMINAL MOMENT */}
        <div className="pt-8">
          <HeroTerminalDemo />
        </div>
      </section>

      {/* 2. THE PROBLEM / COMPARISON MATRIX */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
            Comparative Reasoning Benchmark
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary tracking-tight">
            Why line ownership is not root cause
          </h2>
          <p className="text-sm text-textSecondary max-w-xl mx-auto">
            Traditional tools show who edited a line. CLUDE reasons about semantic causality across the entire commit graph.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Git Blame */}
            <div className="p-6 space-y-3 bg-[#0D0E11]/40">
              <div className="text-textSecondary text-[11px] uppercase tracking-wider font-semibold">
                git blame / Manual Search
              </div>
              <div className="text-sm font-bold text-textPrimary">Line-Level Blame</div>
              <ul className="space-y-2 text-textSecondary text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Shows author who formatted or touched line, ignoring indirect callers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Requires 45–90 minutes of manual bisection during critical outages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Zero awareness of execution flow or semantic side-effects.</span>
                </li>
              </ul>
            </div>

            {/* Generic AI Chat */}
            <div className="p-6 space-y-3 bg-[#0D0E11]/40">
              <div className="text-textSecondary text-[11px] uppercase tracking-wider font-semibold">
                Generic AI Chat (ChatGPT / Copilot)
              </div>
              <div className="text-sm font-bold text-textPrimary">Contextless Analysis</div>
              <ul className="space-y-2 text-textSecondary text-xs">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Has no access to recent commit diffs, PR history, or git blame graph.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Requires engineers to copy-paste multiple files manually.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>Hallucinates confidence without repo AST grounding.</span>
                </li>
              </ul>
            </div>

            {/* CLUDE */}
            <div className="p-6 space-y-3 bg-[#131417] border-l-2 border-l-primary">
              <div className="text-primary text-[11px] uppercase tracking-wider font-semibold flex items-center justify-between">
                <span>CLUDE Platform</span>
                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">Active Engine</span>
              </div>
              <div className="text-sm font-bold text-textPrimary">Semantic Causal Proof</div>
              <ul className="space-y-2 text-textPrimary text-xs font-sans">
                <li className="flex items-start gap-2 font-mono">
                  <span className="text-primary font-bold">✓</span>
                  <span>Extracts AST coordinates and queries temporal commit diff hunks.</span>
                </li>
                <li className="flex items-start gap-2 font-mono">
                  <span className="text-primary font-bold">✓</span>
                  <span>Claude 3.5 Sonnet evaluates causal probability ($0.0 - 1.0$).</span>
                </li>
                <li className="flex items-start gap-2 font-mono">
                  <span className="text-primary font-bold">✓</span>
                  <span>Delivers plain-English proof and remediation in &lt; 8 seconds.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DUAL-FEATURE PILLARS */}
      <section className="space-y-12 max-w-5xl mx-auto">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-surface p-1 border border-border">
            <button
              onClick={() => setActiveTab("rca")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "rca"
                  ? "bg-primary text-primary-foreground font-semibold shadow"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <Bug className="h-4 w-4" />
              <span>Feature 1: Root-Cause Analysis</span>
            </button>
            <button
              onClick={() => setActiveTab("onboarding")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "onboarding"
                  ? "bg-primary text-primary-foreground font-semibold shadow"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Feature 2: AI Onboarding Guide</span>
            </button>
          </div>
        </div>

        {activeTab === "rca" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Multi-Language Normalizer</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Deterministic regex & AST parsers resolve frames across Python tracebacks, JavaScript/TypeScript V8 & WebKit stacks, Go panics, Java exceptions, and Rust backtraces.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Temporal Git Slicer</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Traverses commit graphs within configurable incident windows (e.g. past 14 days), filtering out lockfiles, generated assets, and minified bundles to protect token budgets.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Calibrated Causal Scoring</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Produces normalized probability scores (0.0 to 1.0) with plain-English failure hypotheses and copy-paste remediation diffs instead of binary guesses.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Mermaid Architecture Graphs</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Generates live, interactive Mermaid.js diagrams directly from repository file trees and boundary interfaces to map dependencies visually.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">Critical Execution Paths</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Extracts primary user-facing pipelines, entry points (e.g. main.py, server.ts), authentication gates, and transactional persistence flows.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-surfaceHover flex items-center justify-center border border-border">
                <Shield className="h-5 w-5 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-textPrimary">High-Churn Danger Zones</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Calculates git change frequencies (commit diff churn) to flag fragile concurrency locks and state mutations before junior developers touch them.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. SECURITY & ENTERPRISE ARCHITECTURE */}
      <section className="rounded-2xl border border-border bg-surface p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
              Enterprise Grade Security
            </span>
            <h2 className="text-2xl font-bold text-textPrimary tracking-tight mt-1">
              Zero Raw Code Retention & Least Privilege
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            <span>Read-Only GitHub Permissions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs text-textSecondary">
          <div className="space-y-1.5">
            <div className="text-textPrimary font-semibold flex items-center gap-1.5 font-sans">
              <Lock className="h-4 w-4 text-primary" />
              <span>AES-256-GCM Token Store</span>
            </div>
            <p>GitHub OAuth tokens are encrypted at rest with per-tenant envelope keys.</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-textPrimary font-semibold flex items-center gap-1.5 font-sans">
              <Database className="h-4 w-4 text-primary" />
              <span>pgvector HNSW Indexing</span>
            </div>
            <p>1536-dimensional semantic vectors stored with sub-millisecond distance search.</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-textPrimary font-semibold flex items-center gap-1.5 font-sans">
              <Shield className="h-4 w-4 text-primary" />
              <span>Prompt Injection Guard</span>
            </div>
            <p>Untrusted diffs and commit messages are sanitized inside escaped XML data blocks.</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-textPrimary font-semibold flex items-center gap-1.5 font-sans">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Prompt Caching</span>
            </div>
            <p>Anthropic ephemeral prompt caching cuts token latency and API overhead by 80%.</p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-textPrimary tracking-tight">
          Ready to diagnose production failures in seconds?
        </h2>
        <p className="text-sm text-textSecondary max-w-lg mx-auto">
          Connect your repository link and paste an error trace to pinpoint the causal commit immediately.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/rca"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/25"
          >
            <span>Open Root-Cause Studio</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/repos"
            className="flex items-center gap-2 rounded-lg bg-surface px-6 py-3 text-sm font-medium text-textPrimary border border-border hover:bg-surfaceHover transition-all"
          >
            <GitBranch className="h-4 w-4 text-textSecondary" />
            <span>Manage Repositories</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
