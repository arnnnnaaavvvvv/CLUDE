"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Sparkles,
  Bug,
  BookOpen,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Workflow,
  MessageSquare,
} from "lucide-react";
import { HelpChatbot } from "@/components/HelpChatbot";

export default function HelpAndPlatformGuide() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CLUDE find the commit that broke production?",
      a: "When an error occurs, CLUDE examines the exact changes made in recent commits. It analyzes how the code evolved over time and identifies the exact commit that introduced the problem, explaining why it happened and giving you a fix."
    },
    {
      q: "How does the screenshot feature work in Root-Cause Studio?",
      a: "You can drag and drop any screenshot of your error (like a browser console or terminal screen) into Root-Cause Studio. CLUDE reads the error directly from your screenshot and finds the cause automatically."
    },
    {
      q: "Is my code safe and private?",
      a: "Yes, completely. CLUDE does not permanently store your proprietary source code on external servers. Code is analyzed in temporary memory and immediately cleared."
    },
    {
      q: "Which programming languages are supported?",
      a: "CLUDE supports TypeScript, JavaScript, Python, Go, and Java. It also works seamlessly with full-stack and multi-language projects."
    },
    {
      q: "How does the Onboarding Guide help new developers?",
      a: "The Onboarding Guide creates visual system maps and clear explanations of how a codebase works, helping new developers become productive in days instead of weeks."
    }
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto font-sans pb-16">
      {/* Premium Hero Header */}
      <div className="relative text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border text-xs text-textSecondary backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="font-medium text-textPrimary">Platform Documentation &amp; Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Learning Center &amp; Help
        </h1>

        <p className="text-sm text-textSecondary max-w-xl mx-auto leading-relaxed">
          Step-by-step guides, interactive AI assistance, and essential workflows to help you master root-cause analysis and codebase intelligence.
        </p>
      </div>

      {/* 1. INTERACTIVE CHATBOT SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <h2 className="text-base font-bold text-textPrimary">Ask the Assistant</h2>
          </div>
          <span className="text-xs text-textSecondary">
            Instant answers &amp; walkthroughs
          </span>
        </div>

        <HelpChatbot />
      </div>

      {/* 2. PLATFORM WORKFLOW MODULES */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-sky-400" />
          <h2 className="text-base font-bold text-textPrimary">Platform Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Root-Cause Studio */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all">
            <div className="space-y-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Bug className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-textPrimary">1. Root-Cause Studio</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Paste error logs or drop screenshots to find the exact commit that broke the build and get ready-to-use code fixes.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Attach Error Screenshots</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Author &amp; Committer Details</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>Copyable Fix Code &amp; Diffs</span>
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
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-textPrimary">2. Onboarding Guide</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Generate visual architecture maps, learn how data flows, and see which files are most sensitive to changes.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Visual System Diagrams</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>High-Risk File Warnings</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                  <span>Step-by-Step Setup Steps</span>
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

          {/* Module 3: Repositories */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="space-y-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <GitBranch className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm text-textPrimary">3. Connected Repos</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Connect your GitHub account or link public and private repositories to keep code analysis ready anytime.
              </p>
              <ul className="space-y-1.5 text-xs text-textSecondary pt-1">
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Public &amp; Private Repo Support</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Automatic Code Indexing</span>
                </li>
                <li className="flex items-center gap-1.5 text-textPrimary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Sentry Webhook Automation</span>
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
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-textPrimary">Frequently Asked Questions</h2>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-surface overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-textPrimary hover:bg-surfaceHover/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-textSecondary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-textSecondary flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-textSecondary leading-relaxed border-t border-border/40">
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
