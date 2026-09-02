"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Sparkles,
  Bug,
  BookOpen,
  GitBranch,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Workflow,
  ExternalLink,
} from "lucide-react";
import { HelpChatbot } from "@/components/HelpChatbot";

export default function HelpAndPlatformGuide() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CLUDE identify the exact commit that broke production?",
      a: "Unlike naive `git blame` which only checks who touched a single line, CLUDE parses AST (Abstract Syntax Tree) modifications across all commits within your time window. Claude 3.5 Sonnet performs causal verification against normalized stack coordinates, ranking commits by causal likelihood and explaining the exact runtime failure propagation."
    },
    {
      q: "How does the Screenshot Ingestion feature work in Root-Cause Studio?",
      a: "When you drag-and-drop or upload a screenshot (e.g., of a browser DevTools console, Sentry incident page, terminal panic, or UI error banner), CLUDE's multimodal vision engine extracts visual error codes, failing URLs, and exception messages to complement or substitute for raw textual traces."
    },
    {
      q: "Is my proprietary source code stored or sent to public LLMs?",
      a: "No. CLUDE enforces a strict zero raw-code retention policy. Repositories are processed in ephemeral memory for AST bisection and vector embeddings. For enterprise environments with strict air-gap compliance, CLUDE can be deployed in private VPCs with local LLM endpoints."
    },
    {
      q: "What programming languages and frameworks are supported?",
      a: "CLUDE supports TypeScript/JavaScript (Node.js, Next.js, Express), Python (FastAPI, Django, Flask, PyTorch), Go (Standard library panics, Gin, Fiber), and Java/Kotlin (Spring Boot, Android). Monorepos with multiple languages are parsed automatically."
    },
    {
      q: "How do I generate an architecture walkthrough for a new codebase?",
      a: "Navigate to the Onboarding Guide (/onboarding), select your connected repository, and click 'Generate Walkthrough'. CLUDE will synthesize the entire project structure into an interactive Mermaid.js diagram, critical runtime execution paths, danger zones, and developer setup instructions."
    }
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto font-sans pb-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Help &amp; Platform Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
          Master CLUDE in Minutes
        </h1>
        <p className="text-sm text-textSecondary max-w-2xl mx-auto leading-relaxed">
          Learn how to correlate incidents to git history, ingest error screenshots, generate architectural onboarding guides, or chat with our interactive AI assistant below.
        </p>
      </div>

      {/* 1. INTERACTIVE CHATBOT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-textPrimary">Interactive AI Platform Tutor</h2>
          </div>
          <span className="text-xs font-mono text-textSecondary hidden sm:inline">
            Trained on CLUDE Architecture &amp; Workflows
          </span>
        </div>

        <HelpChatbot />
      </div>

      {/* 2. PLATFORM WORKFLOW MODULES */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-sky-400" />
          <h2 className="text-lg font-bold text-textPrimary">Step-by-Step Platform Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Root-Cause Studio */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Bug className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-textPrimary">1. Root-Cause Studio</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Paste stack traces or drop error screenshots to bisect breaking commits with AST diff analysis and get copyable hotfix patches.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary font-mono pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Multimodal Screenshot Ingestion</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Committer Provenance &amp; Profile</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Interactive Code Fix Snippets</span>
                </li>
              </ul>
            </div>

            <Link
              href="/rca"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surfaceHover hover:bg-blue-600 text-xs font-semibold text-textPrimary hover:text-white border border-border transition-all group"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Module 2: Onboarding Guide */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-sky-500/50 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-textPrimary">2. Onboarding Assistant</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Generate dynamic Mermaid.js architecture topologies, critical paths, danger zones, and setup guides for unfamiliar codebases.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary font-mono pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Mermaid System Topologies</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Danger Zones &amp; High-Churn Files</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Step-by-Step Developer Setup</span>
                </li>
              </ul>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surfaceHover hover:bg-sky-600 text-xs font-semibold text-textPrimary hover:text-white border border-border transition-all group"
            >
              <span>Open Onboarding Guide</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Module 3: Repositories & Webhooks */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-textPrimary">3. Repository Hub</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Connect GitHub accounts with fine-grained tokens, track vector indexing status, and manage monitored repository branches.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary font-mono pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>1536-dim pgvector Indexing</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Real-Time Index Status Polling</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Sentry &amp; Datadog Webhook Support</span>
                </li>
              </ul>
            </div>

            <Link
              href="/repos"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-surfaceHover hover:bg-indigo-600 text-xs font-semibold text-textPrimary hover:text-white border border-border transition-all group"
            >
              <span>Manage Repositories</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. FREQUENTLY ASKED QUESTIONS */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-textPrimary">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-surface overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-textPrimary hover:bg-surfaceHover/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-textSecondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-textSecondary flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-textSecondary leading-relaxed border-t border-border/40 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
