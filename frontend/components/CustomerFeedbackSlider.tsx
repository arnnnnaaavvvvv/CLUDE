"use client";

import React from "react";
import { Star, MessageSquare, Quote, Sparkles, CheckCircle2 } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  highlight: string;
}

const ROW_1: Testimonial[] = [
  {
    name: "Marcus Vance",
    role: "Staff Site Reliability Engineer",
    company: "Fintech Platform",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Cut MTTR by 85% during SEV-1 outages",
    content: "During high-pressure incidents, bisecting 50+ commits across microservices used to take an hour. With CLUDE, we paste the Sentry traceback and get the exact causal commit and fix in under 10 seconds.",
  },
  {
    name: "Elena Rostova",
    role: "VP of Engineering",
    company: "Cloud Infrastructure Co.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "New hire onboarding dropped from 3 weeks to 2 days",
    content: "The AI Onboarding Assistant is genuinely game-changing. Our newly joined engineers explore the generated Mermaid architecture topology and danger zones before submitting their first pull request.",
  },
  {
    name: "David Chen",
    role: "Principal Software Architect",
    company: "Scale AI Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Semantic causality, not naive git blame",
    content: "Standard git blame tells you who formatted a line. CLUDE reasons through the AST state delta and explains why an asynchronous lock change 8 frames up broke execution. Truly brilliant tool.",
  },
  {
    name: "Sophia Martinez",
    role: "Tech Lead",
    company: "SaaS Enterprise Core",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Zero false positives in candidate ranking",
    content: "We connected our repository in seconds without handing over personal access tokens. The calibrated confidence scoring gave our triage team instant clarity on where to rollback.",
  },
];

const ROW_2: Testimonial[] = [
  {
    name: "Julian Becker",
    role: "Lead DevOps Engineer",
    company: "Global Logistics",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Seamless Sentry webhook integration",
    content: "We configured the webhook listener and now production alerts automatically get annotated with the root-cause commit and suggested remediation diff before an engineer even opens Slack.",
  },
  {
    name: "Aisha Patel",
    role: "Senior Backend Developer",
    company: "Autonomous Robotics",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Multi-language parsing that actually works",
    content: "Our monorepo mixes Go services, Python AI pipelines, and TypeScript frontends. CLUDE parses traces across all three without any custom configuration required.",
  },
  {
    name: "Thomas Wright",
    role: "Engineering Director",
    company: "E-Commerce Hypergrowth",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Unmatched developer productivity multiplier",
    content: "The danger zone churn analysis saved us from two critical production regressions this month alone. It flags high-risk concurrency modules before junior devs touch them.",
  },
  {
    name: "Claire Dubois",
    role: "Head of Infrastructure",
    company: "Security Ops Cloud",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Strict zero source code retention",
    content: "Security compliance was our top concern. CLUDE's read-only GitHub integration and local pgvector indexing met our security criteria immediately.",
  },
];

export function CustomerFeedbackSlider() {
  return (
    <section className="space-y-12 max-w-7xl mx-auto px-4 overflow-hidden py-6">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Customer Feedback & Wall of Love</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
          Trusted by engineering leaders worldwide
        </h2>
        <p className="text-sm text-textSecondary max-w-xl mx-auto">
          See how engineering teams at high-growth tech companies eliminate incident bisection and accelerate developer onboarding with CLUDE.
        </p>
      </div>

      {/* Sliding Testimonials Container */}
      <div className="relative space-y-6 pt-4">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: Sliding Left */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee gap-6 py-2 flex items-stretch">
            {[...ROW_1, ...ROW_1].map((item, idx) => (
              <div
                key={`r1-${idx}`}
                className="w-[360px] sm:w-[420px] rounded-2xl border border-border bg-surface p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:bg-[#0c1424] transition-all cursor-pointer group flex-shrink-0"
              >
                <div className="space-y-3">
                  {/* Rating Stars & Highlight */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      Verified User
                    </span>
                  </div>

                  <div className="font-bold text-sm text-textPrimary group-hover:text-blue-300 transition-colors">
                    "{item.highlight}"
                  </div>

                  <p className="text-xs text-textSecondary leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-blue-500/30"
                  />
                  <div>
                    <h5 className="font-semibold text-xs text-textPrimary">{item.name}</h5>
                    <p className="text-[11px] text-textSecondary font-mono">{item.role}</p>
                    <p className="text-[10px] text-blue-400 font-mono">{item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Sliding Right (Reverse) */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-reverse gap-6 py-2 flex items-stretch">
            {[...ROW_2, ...ROW_2].map((item, idx) => (
              <div
                key={`r2-${idx}`}
                className="w-[360px] sm:w-[420px] rounded-2xl border border-border bg-surface p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:bg-[#0c1424] transition-all cursor-pointer group flex-shrink-0"
              >
                <div className="space-y-3">
                  {/* Rating Stars & Highlight */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Verified Review
                    </span>
                  </div>

                  <div className="font-bold text-sm text-textPrimary group-hover:text-blue-300 transition-colors">
                    "{item.highlight}"
                  </div>

                  <p className="text-xs text-textSecondary leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-blue-500/30"
                  />
                  <div>
                    <h5 className="font-semibold text-xs text-textPrimary">{item.name}</h5>
                    <p className="text-[11px] text-textSecondary font-mono">{item.role}</p>
                    <p className="text-[10px] text-sky-400 font-mono">{item.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
