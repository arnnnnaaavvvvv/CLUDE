"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, BookOpen, GitBranch, Terminal, Github, ArrowRight, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/rca", label: "Root-Cause Studio", icon: Bug },
    { href: "/onboarding", label: "Onboarding Guide", icon: BookOpen },
    { href: "/repos", label: "Repositories", icon: GitBranch },
  ];

  return (
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
        <div className="flex items-center gap-3 font-sans">
          <a
            href="https://github.com/arnnnnaaavvvvv/CLUDE"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface px-3 py-1.5 rounded-lg border border-border transition-colors font-mono"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

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
  );
}
