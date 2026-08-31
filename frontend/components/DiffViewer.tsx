"use client";

import React, { useState } from "react";
import { FileCode, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

interface DiffViewerProps {
  filePath: string;
  patch?: string;
}

export function DiffViewer({ filePath, patch }: DiffViewerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (patch) {
      navigator.clipboard.writeText(patch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = patch ? patch.split("\n") : [];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden my-3 font-mono">
      {/* File Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surfaceHover/80 border-b border-border text-xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-textPrimary hover:text-white font-medium transition-colors"
        >
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-textSecondary" /> : <ChevronRight className="h-3.5 w-3.5 text-textSecondary" />}
          <FileCode className="h-3.5 w-3.5 text-blue-400" />
          <span>{filePath}</span>
        </button>

        {patch && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-textSecondary hover:text-textPrimary transition-colors"
            title="Copy diff patch"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {/* Code Content */}
      {isOpen && (
        <div className="overflow-x-auto p-3 text-xs leading-relaxed bg-[#030712]">
          {lines.length > 0 ? (
            lines.map((line, idx) => {
              let lineStyle = "text-textSecondary";
              let bgStyle = "";

              if (line.startsWith("+") && !line.startsWith("+++")) {
                lineStyle = "text-blue-300";
                bgStyle = "bg-blue-950/30 border-l-2 border-blue-400";
              } else if (line.startsWith("-") && !line.startsWith("---")) {
                lineStyle = "text-rose-400";
                bgStyle = "bg-rose-950/25";
              } else if (line.startsWith("@@")) {
                lineStyle = "text-textSecondary/70 italic text-[11px]";
                bgStyle = "bg-surfaceHover/30";
              }

              return (
                <div key={idx} className={`flex px-2 py-0.5 rounded-sm ${bgStyle}`}>
                  <span className="w-8 select-none text-right pr-3 text-textSecondary/40 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className={`${lineStyle} whitespace-pre`}>{line}</span>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-textSecondary italic text-xs">No direct patch available for this file.</div>
          )}
        </div>
      )}
    </div>
  );
}
