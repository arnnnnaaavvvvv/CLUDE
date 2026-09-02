"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  PenSquare,
  Heart,
  Trash2,
  X,
} from "lucide-react";
import { WriteFeedbackModal, ReviewItem } from "./WriteFeedbackModal";

const SEEDED_ROW_1: ReviewItem[] = [
  {
    id: "seed-1",
    name: "Marcus Vance",
    role: "Staff Site Reliability Engineer",
    company: "Fintech Platform",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Cut MTTR by 85% during SEV-1 outages",
    content:
      "During high-pressure incidents, bisecting 50+ commits across microservices used to take an hour. With CLUDE, we paste the Sentry traceback and get the exact causal commit and fix in under 10 seconds.",
    badge: "Verified User",
    likes: 24,
  },
  {
    id: "seed-2",
    name: "Elena Rostova",
    role: "VP of Engineering",
    company: "Cloud Infrastructure Co.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "New hire onboarding dropped from 3 weeks to 2 days",
    content:
      "The AI Onboarding Assistant is genuinely game-changing. Our newly joined engineers explore the generated Mermaid architecture topology and danger zones before submitting their first pull request.",
    badge: "Verified User",
    likes: 19,
  },
  {
    id: "seed-3",
    name: "David Chen",
    role: "Principal Software Architect",
    company: "Scale AI Systems",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Semantic causality, not naive git blame",
    content:
      "Standard git blame tells you who formatted a line. CLUDE reasons through the AST state delta and explains why an asynchronous lock change 8 frames up broke execution. Truly brilliant tool.",
    badge: "Verified User",
    likes: 31,
  },
  {
    id: "seed-4",
    name: "Sophia Martinez",
    role: "Tech Lead",
    company: "SaaS Enterprise Core",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Zero false positives in candidate ranking",
    content:
      "We connected our repository in seconds without handing over personal access tokens. The calibrated confidence scoring gave our triage team instant clarity on where to rollback.",
    badge: "Verified User",
    likes: 15,
  },
];

const SEEDED_ROW_2: ReviewItem[] = [
  {
    id: "seed-5",
    name: "Julian Becker",
    role: "Lead DevOps Engineer",
    company: "Global Logistics",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Seamless Sentry webhook integration",
    content:
      "We configured the webhook listener and now production alerts automatically get annotated with the root-cause commit and suggested remediation diff before an engineer even opens Slack.",
    badge: "Verified Review",
    likes: 22,
  },
  {
    id: "seed-6",
    name: "Aisha Patel",
    role: "Senior Backend Developer",
    company: "Autonomous Robotics",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Multi-language parsing that actually works",
    content:
      "Our monorepo mixes Go services, Python AI pipelines, and TypeScript frontends. CLUDE parses traces across all three without any custom configuration required.",
    badge: "Verified Review",
    likes: 18,
  },
  {
    id: "seed-7",
    name: "Thomas Wright",
    role: "Engineering Director",
    company: "E-Commerce Hypergrowth",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Unmatched developer productivity multiplier",
    content:
      "The danger zone churn analysis saved us from two critical production regressions this month alone. It flags high-risk concurrency modules before junior devs touch them.",
    badge: "Verified Review",
    likes: 27,
  },
  {
    id: "seed-8",
    name: "Claire Dubois",
    role: "Head of Infrastructure",
    company: "Security Ops Cloud",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    highlight: "Strict zero source code retention",
    content:
      "Security compliance was our top concern. CLUDE's read-only GitHub integration and local pgvector indexing met our security criteria immediately.",
    badge: "Verified Review",
    likes: 35,
  },
];

export function CustomerFeedbackSlider() {
  const [userReviews, setUserReviews] = useState<ReviewItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());

  // Load user reviews and likes from localStorage on mount
  useEffect(() => {
    try {
      const storedReviews = localStorage.getItem("clude_user_reviews");
      if (storedReviews) {
        setUserReviews(JSON.parse(storedReviews));
      }
      const storedLikes = localStorage.getItem("clude_review_likes");
      if (storedLikes) {
        setLikedReviewIds(new Set(JSON.parse(storedLikes)));
      }
    } catch (e) {
      console.error("Failed to load stored reviews:", e);
    }
  }, []);

  const handleAddReview = (newReview: ReviewItem) => {
    const updated = [newReview, ...userReviews];
    setUserReviews(updated);
    try {
      localStorage.setItem("clude_user_reviews", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save review:", e);
    }
  };

  const handleDeleteReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = userReviews.filter((r) => r.id !== id);
    setUserReviews(updated);
    try {
      localStorage.setItem("clude_user_reviews", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete review:", e);
    }
    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLikes = new Set(likedReviewIds);
    if (nextLikes.has(id)) {
      nextLikes.delete(id);
    } else {
      nextLikes.add(id);
    }
    setLikedReviewIds(nextLikes);
    try {
      localStorage.setItem("clude_review_likes", JSON.stringify(Array.from(nextLikes)));
    } catch (e) {
      console.error("Failed to save like state:", e);
    }
  };

  // Divide custom reviews between rows for dynamic display
  const customRow1 = userReviews.filter((_, idx) => idx % 2 === 0);
  const customRow2 = userReviews.filter((_, idx) => idx % 2 === 1);

  const fullRow1 = [...customRow1, ...SEEDED_ROW_1];
  const fullRow2 = [...customRow2, ...SEEDED_ROW_2];

  // Repeat for smooth infinite marquee loop
  const displayRow1 = fullRow1.length < 5 ? [...fullRow1, ...fullRow1, ...fullRow1] : [...fullRow1, ...fullRow1];
  const displayRow2 = fullRow2.length < 5 ? [...fullRow2, ...fullRow2, ...fullRow2] : [...fullRow2, ...fullRow2];

  const getBadgeStyle = (badgeName?: string) => {
    if (badgeName?.toLowerCase().includes("user")) {
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
    if (badgeName?.toLowerCase().includes("community") || badgeName?.toLowerCase().includes("tester")) {
      return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    }
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <section className="space-y-10 max-w-7xl mx-auto px-4 overflow-hidden py-8 font-sans">
      {/* Section Header */}
      <div className="text-center space-y-3.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Customer Feedback &amp; Wall of Love</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-textPrimary">
          Trusted by engineering leaders worldwide
        </h2>
        <p className="text-sm text-textSecondary max-w-xl mx-auto leading-relaxed">
          See how engineering teams at high-growth tech companies eliminate incident bisection and accelerate developer onboarding with CLUDE.
        </p>

        {/* Clean, Simple CTA */}
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surfaceHover text-xs font-medium text-textPrimary border border-border hover:border-borderStrong transition-all shadow-sm"
          >
            <PenSquare className="h-3.5 w-3.5 text-blue-400" />
            <span>Share your feedback</span>
          </button>
        </div>
      </div>

      {/* Sliding Testimonials Container */}
      <div className="relative space-y-6 pt-2">
        {/* Left and Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Row 1: Sliding Left */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee gap-6 py-2 flex items-stretch">
            {displayRow1.map((item, idx) => {
              const isLiked = likedReviewIds.has(item.id);
              const currentLikes = (item.likes || 1) + (isLiked ? 1 : 0);

              return (
                <div
                  key={`r1-${idx}-${item.id}`}
                  onClick={() => setSelectedReview(item)}
                  className={`w-[360px] sm:w-[420px] rounded-2xl border p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all cursor-pointer group flex-shrink-0 ${
                    item.isUserSubmission
                      ? "border-blue-500/60 bg-[#0a1224] hover:border-blue-400 hover:bg-[#0e1930] ring-1 ring-blue-500/20"
                      : "border-border bg-surface hover:border-blue-500/50 hover:bg-[#0c1424]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Rating Stars & Highlight */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle(
                            item.badge
                          )}`}
                        >
                          {item.isUserSubmission ? "✨ " : ""}
                          {item.badge || "Verified User"}
                        </span>
                        {item.isUserSubmission && (
                          <button
                            onClick={(e) => handleDeleteReview(item.id, e)}
                            title="Delete your review"
                            className="text-textSecondary hover:text-rose-400 p-1 rounded hover:bg-surface transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="font-bold text-sm text-textPrimary group-hover:text-blue-300 transition-colors">
                      "{item.highlight}"
                    </div>

                    <p className="text-xs text-textSecondary leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </div>

                  {/* User Info & Likes */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover border border-blue-500/30"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            "src",
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              item.name
                            )}`
                          );
                        }}
                      />
                      <div>
                        <h5 className="font-semibold text-xs text-textPrimary">{item.name}</h5>
                        <p className="text-[11px] text-textSecondary font-mono">{item.role}</p>
                        <p className="text-[10px] text-blue-400 font-mono">{item.company}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleLike(item.id, e)}
                      className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        isLiked
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-surface text-textSecondary border-border hover:text-textPrimary"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`} />
                      <span>{currentLikes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Sliding Right (Reverse) */}
        <div className="overflow-hidden flex">
          <div className="animate-marquee-reverse gap-6 py-2 flex items-stretch">
            {displayRow2.map((item, idx) => {
              const isLiked = likedReviewIds.has(item.id);
              const currentLikes = (item.likes || 1) + (isLiked ? 1 : 0);

              return (
                <div
                  key={`r2-${idx}-${item.id}`}
                  onClick={() => setSelectedReview(item)}
                  className={`w-[360px] sm:w-[420px] rounded-2xl border p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all cursor-pointer group flex-shrink-0 ${
                    item.isUserSubmission
                      ? "border-blue-500/60 bg-[#0a1224] hover:border-blue-400 hover:bg-[#0e1930] ring-1 ring-blue-500/20"
                      : "border-border bg-surface hover:border-blue-500/50 hover:bg-[#0c1424]"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Rating Stars & Highlight */}
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle(
                            item.badge
                          )}`}
                        >
                          {item.isUserSubmission ? "✨ " : ""}
                          {item.badge || "Verified Review"}
                        </span>
                        {item.isUserSubmission && (
                          <button
                            onClick={(e) => handleDeleteReview(item.id, e)}
                            title="Delete your review"
                            className="text-textSecondary hover:text-rose-400 p-1 rounded hover:bg-surface transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="font-bold text-sm text-textPrimary group-hover:text-blue-300 transition-colors">
                      "{item.highlight}"
                    </div>

                    <p className="text-xs text-textSecondary leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                  </div>

                  {/* User Info & Likes */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover border border-blue-500/30"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute(
                            "src",
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              item.name
                            )}`
                          );
                        }}
                      />
                      <div>
                        <h5 className="font-semibold text-xs text-textPrimary">{item.name}</h5>
                        <p className="text-[11px] text-textSecondary font-mono">{item.role}</p>
                        <p className="text-[10px] text-sky-400 font-mono">{item.company}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleLike(item.id, e)}
                      className={`flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        isLiked
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-surface text-textSecondary border-border hover:text-textPrimary"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`} />
                      <span>{currentLikes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Write Modal */}
      <WriteFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleAddReview}
      />

      {/* Full Review Detail Modal (When user clicks a card) */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-blue-500/40 bg-[#080E1A] p-7 shadow-2xl space-y-6 font-sans">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(selectedReview.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                      selectedReview.badge
                    )}`}
                  >
                    {selectedReview.badge || "Verified User"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-textPrimary pt-2">
                  "{selectedReview.highlight}"
                </h3>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-1.5 text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">
              {selectedReview.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <div className="flex items-center gap-3">
                <img
                  src={selectedReview.avatar}
                  alt={selectedReview.name}
                  className="h-11 w-11 rounded-full object-cover border border-blue-500/30"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      "src",
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        selectedReview.name
                      )}`
                    );
                  }}
                />
                <div>
                  <h4 className="font-semibold text-sm text-textPrimary">{selectedReview.name}</h4>
                  <p className="text-xs text-textSecondary font-mono">{selectedReview.role}</p>
                  <p className="text-xs text-blue-400 font-mono">{selectedReview.company}</p>
                </div>
              </div>

              <button
                onClick={(e) => handleToggleLike(selectedReview.id, e)}
                className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border transition-all ${
                  likedReviewIds.has(selectedReview.id)
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-surface text-textSecondary border-border hover:text-textPrimary"
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    likedReviewIds.has(selectedReview.id) ? "fill-rose-400 text-rose-400" : ""
                  }`}
                />
                <span>
                  {(selectedReview.likes || 1) + (likedReviewIds.has(selectedReview.id) ? 1 : 0)} Likes
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
