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
  ChevronDown,
  Github,
  Cpu,
  Lock,
  Check,
  Activity,
  Flame,
} from "lucide-react";
import { CustomerFeedbackSlider } from "@/components/CustomerFeedbackSlider";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CLUDE differ from git blame or standard IDE git annotations?",
      a: "Git blame only identifies who last edited a specific line (often just formatting or refactoring). CLUDE performs semantic causality modeling: it extracts exact coordinate frames from your stack trace, slices recent AST diffs across the entire commit graph, and uses LLM reasoning to determine which diff plausibly altered execution state to trigger the runtime failure.",
    },
    {
      q: "Does CLUDE store or train on our proprietary repository source code?",
      a: "No. CLUDE enforces zero raw source code retention. It operates with least-privilege read-only repository permissions, processes diffs in-memory, and all vector embeddings are stored in your private PostgreSQL/pgvector instance. Diffs and prompts are never used for model training.",
    },
    {
      q: "Which programming languages and stack trace formats are supported?",
      a: "CLUDE features deterministic multi-language parsing for JavaScript/TypeScript (V8, WebKit, Node.js), Python (tracebacks, multi-line causes), Go (panics, goroutine stacks), Java (JVM stack traces with nested causes), and Rust (backtraces).",
    },
    {
      q: "Can CLUDE integrate directly with Sentry or CI/CD pipelines?",
      a: "Yes. CLUDE provides automated webhook listener endpoints for Sentry alerts and GitHub push/PR events. When an incident occurs in production, CLUDE can instantly trigger analysis and post causal diagnosis comments directly onto your incident tickets or GitHub PRs.",
    },
    {
      q: "How does the AI Onboarding Assistant work?",
      a: "The onboarding engine traverses the repository file tree, analyzes import graphs and entry points, and calculates git commit churn frequency. It synthesizes a live Mermaid.js system topology diagram, outlines critical business execution paths, and highlights high-risk 'danger zone' modules that have experienced frequent churn.",
    },
    {
      q: "What credentials are required to connect a repository?",
      a: "For public repositories, you only need to paste the GitHub repository link—zero personal access tokens required. For private repositories, tokens are encrypted at rest using AES-256-GCM envelope encryption.",
    },
  ];

  return (
    <div className="w-full space-y-28 pb-20 font-sans text-textPrimary overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-16 text-center max-w-5xl mx-auto px-4">
        {/* Orbiting Concentric Ring Animations in Background */}
        <div className="hidden lg:flex absolute inset-0 top-0 mb-auto flex-col items-center justify-center w-full min-h-[500px] -z-10 pointer-events-none opacity-40">
          <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute inset-0 size-full">
            <circle className="stroke-white/10 stroke-1" strokeDasharray="5 5" cx="50%" cy="50%" r="240" fill="none" />
            <circle className="stroke-white/10 stroke-1" strokeDasharray="5 5" cx="50%" cy="50%" r="380" fill="none" />
            <circle className="stroke-white/10 stroke-1" strokeDasharray="5 5" cx="50%" cy="50%" r="520" fill="none" />
          </svg>
          <div style={{ "--duration": "50s", "--radius": "240px" } as any} className="absolute flex size-6 animate-orbit items-center justify-center rounded-full bg-surface border border-border">
            <Terminal className="h-3 w-3 text-blue-400" />
          </div>
          <div style={{ "--duration": "70s", "--radius": "380px" } as any} className="absolute flex size-6 animate-orbit items-center justify-center rounded-full bg-surface border border-border">
            <GitBranch className="h-3 w-3 text-sky-400" />
          </div>
          <div style={{ "--duration": "90s", "--radius": "520px" } as any} className="absolute flex size-6 animate-orbit items-center justify-center rounded-full bg-surface border border-border">
            <Sparkles className="h-3 w-3 text-blue-300" />
          </div>
        </div>

        {/* Refined Subtle Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[420px] h-[320px] bg-gradient-to-r from-blue-600/10 to-sky-500/10 blur-[6rem] rounded-full pointer-events-none" />


        {/* Main 7XL Headline */}
        <ScrollReveal direction="up" delay={100} duration={800}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-textPrimary leading-[1.1] max-w-4xl mx-auto">
            Pinpoint the exact commit that broke production with{" "}
            <span className="bg-gradient-to-b from-white via-white/95 to-white/75 bg-clip-text text-transparent font-extrabold drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
              AI Precision
            </span>
          </h1>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal direction="up" delay={200} duration={800}>
          <p className="mt-6 text-base sm:text-lg text-textSecondary max-w-2xl mx-auto leading-relaxed">
            AI-powered root-cause reasoning and codebase walkthroughs to maximize incident resolution speed and onboard engineers to complex repositories in minutes.
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal direction="up" delay={300} duration={800}>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8 font-sans">
            <Link
              href="/rca"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/15 transition-all hover:-translate-y-0.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/onboarding"
              className="flex items-center gap-2 rounded-lg bg-surface hover:bg-surfaceHover px-7 py-3.5 text-sm font-medium text-textPrimary border border-border hover:border-borderStrong transition-all hover:-translate-y-0.5"
            >
              <BookOpen className="h-4 w-4 text-textSecondary" />
              <span>Explore Onboarding Guide</span>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* 2. LOGO CLOUD / SOCIAL PROOF */}
      <ScrollReveal direction="fade" duration={700}>
        <section className="text-center space-y-6 max-w-5xl mx-auto px-4 border-y border-border py-12">
          <h4 className="text-xs font-mono uppercase tracking-wider text-textSecondary font-semibold">
            Seamlessly integrated with modern developer ecosystems
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-textSecondary/70 font-mono text-sm">
            <div className="flex items-center gap-2 hover:text-textPrimary transition-colors">
              <GitBranch className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">GitHub GraphQL & Webhooks</span>
            </div>
            <div className="flex items-center gap-2 hover:text-textPrimary transition-colors">
              <Activity className="h-4 w-4 text-rose-400" />
              <span className="font-semibold">Sentry Ingestion</span>
            </div>
            <div className="flex items-center gap-2 hover:text-textPrimary transition-colors">
              <Database className="h-4 w-4 text-sky-400" />
              <span className="font-semibold">pgvector 1536-dim</span>
            </div>
            <div className="flex items-center gap-2 hover:text-textPrimary transition-colors">
              <Cpu className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">Claude 3.5 Sonnet</span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 3. BENTO GRID FEATURES SECTION */}
      <section className="space-y-12 max-w-6xl mx-auto px-4">
        <ScrollReveal direction="up" duration={700}>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              <span>Features</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
              Everything you need to resolve incidents faster
            </h2>
            <p className="text-sm sm:text-base text-textSecondary max-w-xl mx-auto">
              A cohesive architecture combining AST-level coordinate extraction, vector similarity, and LLM causal reasoning.
            </p>
          </div>
        </ScrollReveal>

        {/* Bento Grid with Staggered Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Language Frame Normalizer (Span 2) */}
          <ScrollReveal direction="up" delay={100} duration={700} className="md:col-span-2">
            <div className="h-full rounded-2xl border border-border bg-surface p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#030712] flex items-center justify-center border border-border group-hover:border-blue-500/50 transition-colors">
                  <Code2 className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Multi-Language Stack Frame Normalizer</h3>
                <p className="text-xs text-textSecondary leading-relaxed max-w-xl">
                  Deterministic coordinate extractors automatically parse stack traces across TypeScript, Python, Go, Java, and Rust. Resolves relative file paths, execution line numbers, and function symbols across all runtime formats.
                </p>
              </div>

              {/* Visual Box */}
              <div className="rounded-xl border border-border bg-[#030712] p-4 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-textSecondary text-[11px] pb-1 border-b border-border/50">
                  <span>PARSED COORDINATES</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Normalized
                  </span>
                </div>
                <div className="flex items-center justify-between text-textPrimary text-[11px]">
                  <span className="text-blue-400 font-semibold">src/services/payment.ts:142:28</span>
                  <span className="text-textSecondary">PaymentProcessor.processOrder</span>
                </div>
                <div className="flex items-center justify-between text-textPrimary text-[11px]">
                  <span className="text-blue-400 font-semibold">src/controllers/checkout.ts:89:12</span>
                  <span className="text-textSecondary">CheckoutController.handleCheckout</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Temporal Git Slicer */}
          <ScrollReveal direction="up" delay={200} duration={700}>
            <div className="h-full rounded-2xl border border-border bg-surface p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#030712] flex items-center justify-center border border-border group-hover:border-blue-500/50 transition-colors">
                  <GitBranch className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Temporal Git Slicer</h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Traverses commit graphs within configurable incident windows, stripping lockfiles and generated assets to isolate high-signal diff hunks.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-[#030712] p-3 font-mono text-xs text-textSecondary space-y-1">
                <div className="text-blue-400 font-semibold text-[11px]">Temporal Window: 14 Days</div>
                <div className="text-[11px]">Filtered: package-lock.json, *.min.js</div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Calibrated Causal Scoring */}
          <ScrollReveal direction="up" delay={150} duration={700}>
            <div className="h-full rounded-2xl border border-border bg-surface p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#030712] flex items-center justify-center border border-border group-hover:border-blue-500/50 transition-colors">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Calibrated Causal Scoring</h3>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Generates probability rankings (0.00 to 1.00) with plain-English hypotheses and actionable code fixes instead of binary blame.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="h-2 flex-1 bg-[#0F172A] rounded-full overflow-hidden border border-border">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-blue-600 w-[94%]" />
                </div>
                <span className="text-blue-400 font-bold">94% Confidence</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 4: Architecture Topology Synthesis (Span 2) */}
          <ScrollReveal direction="up" delay={250} duration={700} className="md:col-span-2">
            <div className="h-full rounded-2xl border border-border bg-surface p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-[#030712] flex items-center justify-center border border-border group-hover:border-blue-500/50 transition-colors">
                  <Layers className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Automated Architecture Topology & Danger Zones</h3>
                <p className="text-xs text-textSecondary leading-relaxed max-w-xl">
                  Automatically synthesizes live Mermaid.js system diagrams from repository file trees, highlights critical business paths, and calculates commit churn frequency to flag fragile modules.
                </p>
              </div>

              {/* Visual Mini Graph */}
              <div className="rounded-xl border border-border bg-[#030712] p-3 font-mono text-xs flex flex-wrap items-center justify-between gap-2 text-textSecondary text-[11px]">
                <span className="text-textPrimary font-semibold">Client Layer &rarr; API Gateway &rarr; Domain Service &rarr; pgvector</span>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" /> High Churn Detected
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. STEP-BY-STEP WORKFLOW */}
      <section className="space-y-12 max-w-6xl mx-auto px-4">
        <ScrollReveal direction="up" duration={700}>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              <span>Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
              How CLUDE works in 4 simple steps
            </h2>
            <p className="text-sm text-textSecondary max-w-lg mx-auto">
              From raw production log to verified candidate commit in under 8 seconds.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Connect Repo Link",
              desc: "Paste your GitHub repository link or name. No personal access tokens required for public repos.",
            },
            {
              step: "02",
              title: "Ingest Trace or Log",
              desc: "Paste an error log or receive real-time webhook payloads from Sentry during a live incident.",
            },
            {
              step: "03",
              title: "AST & Diff Correlation",
              desc: "CLUDE maps failing frame coordinates against recent AST diffs and commit histories.",
            },
            {
              step: "04",
              title: "Causal Proof & Fix",
              desc: "Claude 3.5 Sonnet outputs ranked commits with confidence scores and verified code fixes.",
            },
          ].map((item, idx) => (
            <ScrollReveal key={idx} direction="up" delay={idx * 100} duration={700}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6 space-y-3 relative hover:border-blue-500/40 transition-all">
                <div className="font-mono text-2xl font-bold text-blue-400 opacity-90">{item.step}</div>
                <h4 className="text-base font-bold text-textPrimary">{item.title}</h4>
                <p className="text-xs text-textSecondary leading-relaxed">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 5. COMPARISON TABLE */}
      <section className="space-y-8 max-w-5xl mx-auto px-4">
        <ScrollReveal direction="up" duration={700}>
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
              Comparative Benchmark
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-textPrimary tracking-tight">
              Traditional approaches vs CLUDE
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="zoom" delay={150} duration={800}>
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xl font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="p-6 space-y-3 bg-[#030712]/60">
                <div className="text-textSecondary text-[11px] uppercase tracking-wider font-semibold">
                  git blame
                </div>
                <div className="text-sm font-bold text-textPrimary font-sans">Line Ownership</div>
                <ul className="space-y-2 text-textSecondary text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Shows who formatted a line, not who broke caller logic.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Requires 45–90 min of manual bisection during incidents.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 space-y-3 bg-[#030712]/60">
                <div className="text-textSecondary text-[11px] uppercase tracking-wider font-semibold">
                  Generic AI Chat
                </div>
                <div className="text-sm font-bold text-textPrimary font-sans">Contextless Guesses</div>
                <ul className="space-y-2 text-textSecondary text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Has no access to git diff graph or recent PR histories.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>Hallucinates causes without AST coordinate verification.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 space-y-3 bg-[#080E1A] border-l-2 border-l-blue-500">
                <div className="text-blue-400 text-[11px] uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span>CLUDE Platform</span>
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px]">Active</span>
                </div>
                <div className="text-sm font-bold text-textPrimary font-sans">Semantic Causal Proof</div>
                <ul className="space-y-2 text-textPrimary text-xs font-sans">
                  <li className="flex items-start gap-2 font-mono">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Correlates stack coordinates with temporal commit hunks.</span>
                  </li>
                  <li className="flex items-start gap-2 font-mono">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Calibrated confidence scoring with actionable code fixes.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="space-y-12 max-w-6xl mx-auto px-4">
        <ScrollReveal direction="up" duration={700}>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              <span>Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
              Transparent plans for engineering teams
            </h2>
            <p className="text-sm text-textSecondary max-w-md mx-auto">
              Choose the plan that best fits your incident response and repository scale.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-medium ${billingCycle === "monthly" ? "text-textPrimary" : "text-textSecondary"}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className="w-12 h-6 rounded-full bg-surface border border-border p-0.5 flex items-center transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-transform ${
                    billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-medium flex items-center gap-1.5 ${billingCycle === "annual" ? "text-textPrimary" : "text-textSecondary"}`}>
                <span>Annual</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Save 20%
                </span>
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* Pricing Cards Grid with Staggered Animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Tier 1: Developer */}
          <ScrollReveal direction="up" delay={100} duration={700}>
            <div className="h-full rounded-2xl border border-border bg-surface p-8 space-y-6 flex flex-col justify-between hover:border-borderStrong transition-all">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-textPrimary">Developer</h3>
                <p className="text-xs text-textSecondary">Perfect for open-source contributors and individual engineers.</p>
                <div className="font-mono">
                  <span className="text-4xl font-bold text-textPrimary">$0</span>
                  <span className="text-xs text-textSecondary"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-textSecondary font-sans border-t border-border pt-4">
                  <li className="flex items-center gap-2 font-mono text-textPrimary">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Unlimited public repositories</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono text-textPrimary">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Interactive Root-Cause Studio</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono text-textPrimary">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Mermaid Architecture Guides</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono text-textSecondary">
                    <Check className="h-4 w-4 text-textSecondary" />
                    <span>Community Discord Support</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rca"
                className="w-full text-center rounded-lg bg-surfaceHover py-2.5 text-xs font-semibold text-textPrimary hover:bg-surfaceHover/80 border border-border transition-colors block"
              >
                Get Started Free
              </Link>
            </div>
          </ScrollReveal>

          {/* Tier 2: Team Pro */}
          <ScrollReveal direction="up" delay={200} duration={700}>
            <div className="h-full rounded-2xl border-2 border-blue-500 bg-surface p-8 space-y-6 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-400 to-blue-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-textPrimary">Team Pro</h3>
                <p className="text-xs text-textSecondary">For fast-moving engineering teams managing production services.</p>
                <div className="font-mono">
                  <span className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                    {billingCycle === "monthly" ? "$49" : "$39"}
                  </span>
                  <span className="text-xs text-textSecondary"> / seat / mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-textPrimary font-sans border-t border-border pt-4">
                  <li className="flex items-center gap-2 font-mono">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Private repositories & organizations</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Sentry & GitHub Webhook triggers</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>1536-dim pgvector semantic search</span>
                  </li>
                  <li className="flex items-center gap-2 font-mono">
                    <Check className="h-4 w-4 text-blue-400" />
                    <span>Automated PR risk annotations</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/rca"
                className="w-full text-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all block"
              >
                Start 14-Day Free Trial
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. SLIDING CUSTOMER FEEDBACK ANIMATION */}
      <ScrollReveal direction="fade" duration={800}>
        <CustomerFeedbackSlider />
      </ScrollReveal>

      {/* 8. FAQ ACCORDION */}
      <section className="space-y-8 max-w-4xl mx-auto px-4">
        <ScrollReveal direction="up" duration={700}>
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-textPrimary">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">
              Everything you need to know about CLUDE’s architecture and security.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 60} duration={600}>
                <div className="rounded-xl border border-border bg-surface overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 text-sm font-semibold text-textPrimary hover:text-white transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-textSecondary transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-textSecondary leading-relaxed font-sans border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* 9. FOOTER */}
      <ScrollReveal direction="fade" duration={800}>
        <footer className="border-t border-border pt-12 pb-8 max-w-6xl mx-auto px-4 font-sans text-xs text-textSecondary">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Terminal className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-bold text-base text-textPrimary">CLUDE</span>
              </div>
              <p className="text-xs text-textSecondary max-w-sm leading-relaxed">
                Pinpoint the exact commit that broke production with causal AI reasoning, and onboard engineers to unfamiliar codebases in minutes.
              </p>
            </div>

            <div className="space-y-2.5">
              <h5 className="font-semibold text-textPrimary font-mono uppercase text-[11px]">Product</h5>
              <ul className="space-y-2">
                <li><Link href="/rca" className="hover:text-textPrimary transition-colors">Root-Cause Studio</Link></li>
                <li><Link href="/onboarding" className="hover:text-textPrimary transition-colors">Onboarding Guide</Link></li>
                <li><Link href="/repos" className="hover:text-textPrimary transition-colors">Repositories</Link></li>
                <li><Link href="/help" className="hover:text-textPrimary transition-colors">Help &amp; AI Chatbot Guide</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h5 className="font-semibold text-textPrimary font-mono uppercase text-[11px]">Resources</h5>
              <ul className="space-y-2">
                <li><a href="https://github.com/arnnnnaaavvvvv/CLUDE" target="_blank" rel="noreferrer" className="hover:text-textPrimary transition-colors flex items-center gap-1"><Github className="h-3.5 w-3.5" /> GitHub Repository</a></li>
                <li><a href="https://clude-e940d.web.app" target="_blank" rel="noreferrer" className="hover:text-textPrimary transition-colors">Firebase Hosting</a></li>
                <li><a href="https://frontend-mu-roan-llgeruknl5.vercel.app" target="_blank" rel="noreferrer" className="hover:text-textPrimary transition-colors">Vercel Deployment</a></li>
                <li><span className="text-emerald-400 font-mono text-[11px]">All Systems Normal</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
            <div>&copy; {new Date().getFullYear()} CLUDE Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 text-textSecondary">
              <a href="https://github.com/arnnnnaaavvvvv/CLUDE/blob/main/LICENSE" target="_blank" rel="noreferrer" className="hover:text-textPrimary">MIT License</a>
              <span>•</span>
              <a href="https://github.com/arnnnnaaavvvvv/CLUDE" target="_blank" rel="noreferrer" className="hover:text-textPrimary">Source Code</a>
            </div>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  );
}
