"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, BookOpen, GitBranch, Terminal, Github, ArrowRight, Shield } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/rca", label: "Root-Cause Studio", icon: Bug },
    { href: "/onboarding", label: "Onboarding Guide", icon: BookOpen },
    { href: "/repos", label: "Repositories", icon: GitBranch },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-7xl">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border group-hover:border-primary/50 transition-colors">
            <Terminal className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-textPrimary font-sans">
              CLUDE
            </span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">
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
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-surface text-textPrimary border border-borderStrong"
                    : "text-textSecondary hover:text-textPrimary hover:bg-surface/50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-textSecondary"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/arnnnnaaavvvvv/CLUDE"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface px-2.5 py-1.5 rounded-md border border-border transition-colors font-mono"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>

          <Link
            href="/rca"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover transition-colors font-sans"
          >
            <span>Launch Studio</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
