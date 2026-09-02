"use client";

import React, { useState } from "react";
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
  HelpCircle,
  LogIn,
  User as UserIcon,
  Shield,
} from "lucide-react";
import { GitHubConnectModal } from "./GitHubConnectModal";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/lib/authContext";
import { clearLocalCustomRepos } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [gitHubModalOpen, setGitHubModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDisconnect = () => {
    clearLocalCustomRepos();
    logout();
    setDropdownOpen(false);
  };

  const navItems = [
    { href: "/rca", label: "Root-Cause Studio", icon: Bug },
    { href: "/onboarding", label: "Onboarding Guide", icon: BookOpen },
    { href: "/repos", label: "Repositories", icon: GitBranch },
    { href: "/help", label: "Help & Guide", icon: HelpCircle },
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
            <span className="font-bold text-lg tracking-tight text-textPrimary font-sans">
              CLUDE
            </span>
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
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl bg-surface hover:bg-surfaceHover border border-blue-500/30 px-3 py-1.5 text-xs font-medium text-textPrimary transition-all shadow-sm group"
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-5 w-5 rounded-full object-cover border border-blue-400"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-400 flex items-center justify-center text-[10px] font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#0B0F19]" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="font-medium text-xs text-textPrimary block leading-none">{user.name}</span>
                  </div>
                  {user.provider === "google" && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Google
                    </span>
                  )}
                  {user.provider === "github" && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      GitHub
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 text-textSecondary group-hover:text-textPrimary transition-colors" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-[#0B0F19] p-2.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
                    <div className="px-3 py-2.5 border-b border-border/50 mb-1.5 bg-surface/50 rounded-xl">
                      <div className="font-bold text-xs text-textPrimary flex items-center justify-between">
                        <span>{user.name}</span>
                        <span className="text-[10px] font-mono uppercase text-blue-400 font-normal">
                          {user.provider}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-textSecondary truncate mt-0.5">{user.email}</div>
                      {user.role && (
                        <div className="text-[10px] text-sky-400/80 font-mono mt-1 flex items-center gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          <span>{user.role}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setGitHubModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-blue-400" />
                      <span>Connect GitHub Repos</span>
                    </button>

                    <Link
                      href="/rca"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors"
                    >
                      <Bug className="h-3.5 w-3.5 text-sky-400" />
                      <span>Root-Cause Studio</span>
                    </Link>

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-border/40 mt-1"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover px-3 py-1.5 rounded-xl border border-border hover:border-borderStrong transition-colors"
                >
                  <LogIn className="h-3.5 w-3.5 text-blue-400" />
                  <span>Sign In</span>
                </Link>

                <button
                  onClick={() => setGitHubModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover px-3 py-1.5 rounded-xl border border-border transition-colors font-mono"
                >
                  <Github className="h-3.5 w-3.5 text-blue-400" />
                  <span>Connect GitHub</span>
                </button>
              </>
            )}

            <Link
              href="/rca"
              className="flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 font-sans"
            >
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={gitHubModalOpen}
        onClose={() => setGitHubModalOpen(false)}
        onConnected={() => setGitHubModalOpen(false)}
      />

      {/* In-place Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
