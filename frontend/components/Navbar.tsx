"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bug,
  BookOpen,
  GitBranch,
  Terminal,
  Github,
  ArrowRight,
  Plus,
  LogOut,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { GitHubConnectModal } from "./GitHubConnectModal";

interface GitHubProfile {
  username: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

export function Navbar() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadProfile = () => {
    try {
      const stored = localStorage.getItem("clude_github_profile");
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile(null);
      }
    } catch {}
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem("clude_github_profile");
    setProfile(null);
    setDropdownOpen(false);
    window.location.reload();
  };

  const navItems = [
    { href: "/rca", label: "Root-Cause Studio", icon: Bug },
    { href: "/onboarding", label: "Onboarding Guide", icon: BookOpen },
    { href: "/repos", label: "Repositories", icon: GitBranch },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-full items-center justify-between px-4 max-w-7xl">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30 group-hover:border-blue-500/60 transition-colors shadow-sm shadow-blue-500/10">
              <Terminal className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-textPrimary font-sans">
                CLUDE
              </span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                v1.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-sans">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-surfaceHover text-textPrimary border border-borderStrong shadow-sm"
                      : "text-textSecondary hover:text-textPrimary hover:bg-surface/50"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-400" : "text-textSecondary"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-3 font-sans relative">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg bg-surface hover:bg-surfaceHover border border-blue-500/30 px-3 py-1.5 text-xs font-medium text-textPrimary transition-all shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="h-5 w-5 rounded-full object-cover border border-blue-400"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#0B0F19]" />
                  </div>
                  <span className="font-mono text-xs text-blue-400">@{profile.username}</span>
                  <ChevronDown className="h-3 w-3 text-textSecondary" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-[#0B0F19] p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                      <div className="font-bold text-xs text-textPrimary">{profile.name || profile.username}</div>
                      <div className="text-[11px] font-mono text-blue-400">@{profile.username}</div>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-400" />
                      <span>Connect More Repos</span>
                    </button>

                    <a
                      href={`https://github.com/${profile.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-textSecondary" />
                      <span>View GitHub Profile</span>
                    </a>

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-border/40 mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Disconnect Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover px-3 py-1.5 rounded-lg border border-border transition-colors font-mono"
              >
                <Github className="h-3.5 w-3.5 text-blue-400" />
                <span>Connect GitHub</span>
              </button>
            )}

            <Link
              href="/rca"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Interactive GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          loadProfile();
        }}
        onConnected={loadProfile}
      />
    </>
  );
}
