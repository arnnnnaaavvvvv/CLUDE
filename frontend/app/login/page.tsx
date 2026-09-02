"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Shield, Zap, GitBranch, ArrowLeft, CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center py-6">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-sky-500/10 to-transparent blur-[6rem] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 -z-10 w-72 h-72 bg-blue-500/5 blur-[5rem] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Story & Value Props */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 rounded-3xl bg-surface/40 border border-border/70 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Next-Gen Incident Intelligence</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-textPrimary leading-tight">
              Instant root-cause reasoning for modern engineering teams.
            </h1>

            <p className="mt-4 text-sm text-textSecondary leading-relaxed">
              Connect your repositories to correlate stack traces with commit graphs, AST hunks, and exact automated code patches.
            </p>

            {/* Feature Bullet Points */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textPrimary">Deterministic AST Diff Slicing</h4>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Isolates exact syntax trees modified across recent commit windows.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textPrimary">Zero Code Retention</h4>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Source code is analyzed ephemerally in-memory with enterprise encryption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <GitBranch className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-textPrimary">Automated Architecture Maps</h4>
                  <p className="text-[11px] text-textSecondary mt-0.5">
                    Generate visual dependency graphs and onboarding guides in seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs text-textSecondary italic">
              &quot;CLUDE saved us hours during a Tier-1 production incident by immediately isolating an unawaited promise in our payment gateway.&quot;
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center font-bold text-[10px] text-blue-300">
                SR
              </div>
              <div>
                <div className="text-xs font-medium text-textPrimary">Sarah Roberts</div>
                <div className="text-[10px] text-textSecondary">Staff Reliability Engineer • ScaleOps</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Login Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-[#080E1A]/90 border border-border p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
