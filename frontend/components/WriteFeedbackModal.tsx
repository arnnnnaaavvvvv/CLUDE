"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Sparkles,
  Send,
  User,
  Building,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Github,
  Image as ImageIcon,
  Tag,
  Check,
} from "lucide-react";

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  highlight: string;
  content: string;
  badge?: string;
  createdAt?: string;
  likes?: number;
  isUserSubmission?: boolean;
}

interface WriteFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (review: ReviewItem) => void;
}

const PRESET_AVATARS = [
  {
    label: "Alex",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "David",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Elena",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Sophia",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Marcus",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    label: "Claire",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
];

const BADGE_OPTIONS = [
  "Verified User",
  "Community Review",
  "Staff Engineer",
  "DevOps Lead",
  "Solutions Architect",
  "Beta Tester",
];

export function WriteFeedbackModal({ isOpen, onClose, onSubmitSuccess }: WriteFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [highlight, setHighlight] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [badge, setBadge] = useState("Community Review");
  const [avatarOption, setAvatarOption] = useState<"preset" | "github" | "custom">("preset");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [githubUsername, setGithubUsername] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-detect connected GitHub profile
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSuccess(false);
      try {
        const storedProfile = localStorage.getItem("clude_github_profile");
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          if (profile.name) setName(profile.name);
          else if (profile.username) setName(profile.username);
          if (profile.username) {
            setGithubUsername(profile.username);
            setAvatarOption("github");
          }
          if (profile.avatar_url) {
            setSelectedAvatarUrl(profile.avatar_url);
          }
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentEffectiveRating = hoverRating || rating;

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return "5/5 — Exceptional! Game-changing root-cause speed";
      case 4:
        return "4/5 — Very Good! Highly effective AI attribution";
      case 3:
        return "3/5 — Good & Solid tool with helpful insights";
      case 2:
        return "2/5 — Fair — Needs additional feature improvements";
      case 1:
        return "1/5 — Critical issues encountered";
      default:
        return "Select your star rating";
    }
  };

  const getAvatarUrl = (): string => {
    if (avatarOption === "github" && githubUsername.trim()) {
      return `https://github.com/${githubUsername.trim().replace(/^@/, "")}.png`;
    }
    if (avatarOption === "custom" && customAvatarUrl.trim()) {
      return customAvatarUrl.trim();
    }
    return (
      selectedAvatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Dev")}`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!highlight.trim()) {
      setError("Please provide a short headline/highlight for your review.");
      return;
    }
    if (!content.trim()) {
      setError("Please write your review / feedback comments.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Please provide at least 10 characters of feedback.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name or developer handle.");
      return;
    }
    if (!role.trim()) {
      setError("Please enter your engineering role or title.");
      return;
    }
    if (!company.trim()) {
      setError("Please enter your company, organization, or project.");
      return;
    }

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      avatar: getAvatarUrl(),
      rating,
      highlight: highlight.trim(),
      content: content.trim(),
      badge,
      createdAt: new Date().toISOString(),
      likes: 1,
      isUserSubmission: true,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmitSuccess(newReview);

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        // Reset form fields
        setHighlight("");
        setContent("");
      }, 1400);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-[#080E1A] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60 bg-[#0B1324]/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                Share Your Feedback & Review
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Community Wall
                </span>
              </h3>
              <p className="text-xs text-textSecondary">
                Help fellow developers and share how CLUDE enhances your incident response workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Splash */}
        {isSuccess ? (
          <div className="p-12 text-center space-y-4 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-textPrimary">Thank You for Your Feedback!</h4>
            <p className="text-sm text-textSecondary max-w-md">
              Your review has been successfully published and added to the Wall of Love.
            </p>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating Section */}
            <div className="space-y-2 rounded-xl border border-border bg-[#030712] p-4">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                <span>Overall Rating</span>
                <span className="text-blue-400 lowercase font-sans font-normal text-xs">
                  {rating} of 5 stars
                </span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isActive = starVal <= currentEffectiveRating;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-textSecondary hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          isActive
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                            : "text-textSecondary/40"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-mono text-amber-300/90 pt-1">
                {getRatingLabel(currentEffectiveRating)}
              </p>
            </div>

            {/* Headline / Highlight */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                <span>Headline / Highlight Quote *</span>
                <span className="text-[11px] text-textSecondary lowercase">e.g. key outcome</span>
              </label>
              <input
                type="text"
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                placeholder="e.g. Cut MTTR by 85% during SEV-1 microservice outages"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Full Review Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-textSecondary flex items-center justify-between">
                <span>Detailed Review & Feedback *</span>
                <span className="text-[11px] font-mono text-textSecondary">
                  {content.length} characters
                </span>
              </label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with CLUDE's root-cause attribution, AST git diff slicing, architecture onboarding diagrams, or webhook triggers..."
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none font-sans"
              />
            </div>

            {/* Author Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-textSecondary flex items-center gap-1">
                  <User className="h-3 w-3 text-blue-400" />
                  <span>Your Name *</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-textSecondary flex items-center gap-1">
                  <Briefcase className="h-3 w-3 text-blue-400" />
                  <span>Role / Title *</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Staff SRE Lead"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-textSecondary flex items-center gap-1">
                  <Building className="h-3 w-3 text-blue-400" />
                  <span>Company / Project *</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Fintech Cloud"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2 rounded-xl border border-border bg-[#030712] p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                  <span>Choose Avatar</span>
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setAvatarOption("preset")}
                    className={`px-2 py-0.5 rounded ${
                      avatarOption === "preset"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarOption("github")}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      avatarOption === "github"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    <Github className="h-2.5 w-2.5" />
                    GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarOption("custom")}
                    className={`px-2 py-0.5 rounded ${
                      avatarOption === "custom"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {avatarOption === "preset" && (
                <div className="flex items-center gap-3 pt-1">
                  {PRESET_AVATARS.map((av, idx) => {
                    const isSelected = selectedAvatarUrl === av.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(av.url)}
                        className={`relative rounded-full transition-transform hover:scale-110 focus:outline-none ${
                          isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#030712]" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.label}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                            <Check className="h-2 w-2" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {avatarOption === "github" && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-textSecondary font-mono">@</span>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="github_username"
                      className="w-full rounded-xl border border-border bg-surface pl-7 pr-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                  {githubUsername.trim() && (
                    <img
                      src={`https://github.com/${githubUsername.trim().replace(/^@/, "")}.png`}
                      alt="Preview"
                      className="h-9 w-9 rounded-full object-cover border border-blue-500/30"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
              )}

              {avatarOption === "custom" && (
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none font-mono"
                  />
                  {customAvatarUrl.trim() && (
                    <img
                      src={customAvatarUrl.trim()}
                      alt="Custom preview"
                      className="h-9 w-9 rounded-full object-cover border border-blue-500/30"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Badge Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-textSecondary flex items-center gap-1">
                <Tag className="h-3 w-3 text-blue-400" />
                <span>Verification Tag</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BADGE_OPTIONS.map((b) => {
                  const isSelected = badge === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBadge(b)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/50 font-semibold"
                          : "bg-surface text-textSecondary border-border hover:border-borderStrong"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover rounded-xl border border-border transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
