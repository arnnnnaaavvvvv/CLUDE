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
    <div className="rounded-lg border border-border bg-surface overflow-hidden my-3">
      {/* File Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-surfaceHover/50 border-b border-border text-xs font-mono">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-200 hover:text-white font-medium"
        >
          {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          <FileCode className="h-3.5 w-3.5 text-primary" />
          <span>{filePath}</span>
        </button>

        {patch && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors"
            title="Copy diff patch"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}
      </div>

      {/* Code / Patch Content */}
      {isOpen && (
        <div className="overflow-x-auto p-2 font-mono text-xs leading-relaxed bg-[#0a0e17]">
          {lines.length > 0 ? (
            lines.map((line, idx) => {
              let lineStyle = "text-gray-400";
              let bgStyle = "";

              if (line.startsWith("+") && !line.startsWith("+++")) {
                lineStyle = "text-emerald-400";
                bgStyle = "bg-emerald-950/40";
              } else if (line.startsWith("-") && !line.startsWith("---")) {
                lineStyle = "text-rose-400";
                bgStyle = "bg-rose-950/40";
              } else if (line.startsWith("@@")) {
                lineStyle = "text-indigo-400 font-semibold";
                bgStyle = "bg-indigo-950/30";
              }

              return (
                <div key={idx} className={`flex px-2 py-0.5 rounded-sm ${bgStyle}`}>
                  <span className="w-8 select-none text-right pr-3 text-gray-600 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className={`${lineStyle} whitespace-pre`}>{line}</span>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-gray-500 italic">No direct patch available for this file.</div>
          )}
        </div>
      )}
    </div>
  );
}
