"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, BookOpen, GitBranch, Cpu } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Repositories", icon: GitBranch },
    { href: "/rca", label: "Root Cause Studio", icon: Bug },
    { href: "/onboarding", label: "Onboarding Guide", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              CLUDE <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">v1.0</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider -mt-1">
              CODE INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-surfaceHover text-white shadow-sm border border-border"
                    : "text-gray-400 hover:bg-surface hover:text-gray-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-gray-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-surface px-3 py-1.5 rounded-full border border-border">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span>AI Reasoning Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
