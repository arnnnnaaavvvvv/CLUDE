"use client";

import React, { useState } from "react";
import { Copy, Check, Info, AlertTriangle, ShieldAlert, Sparkles, Terminal, BookOpen, Layers } from "lucide-react";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content into blocks (code blocks, tables, alerts, headers, paragraphs, lists)
  const renderFormattedContent = () => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    const parseInline = (text: string): React.ReactNode[] => {
      // Parse `code`, **bold**, *italic*, [links]
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Match inline code `...`
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
          parts.push(
            <code
              key={`code-${key++}`}
              className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-blue-300 border border-blue-500/20"
            >
              {codeMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeMatch[0].length);
          continue;
        }

        // Match bold **...**
        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
          parts.push(
            <strong key={`bold-${key++}`} className="font-bold text-textPrimary tracking-tight">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch[0].length);
          continue;
        }

        // Match italic *...*
        const italicMatch = remaining.match(/^\*([^*]+)\*/);
        if (italicMatch) {
          parts.push(
            <em key={`italic-${key++}`} className="italic text-textSecondary">
              {italicMatch[1]}
            </em>
          );
          remaining = remaining.slice(italicMatch[0].length);
          continue;
        }

        // Regular character slice until next special token
        const nextSpecial = remaining.search(/[`*]/);
        if (nextSpecial === -1) {
          parts.push(remaining);
          break;
        } else if (nextSpecial === 0) {
          parts.push(remaining[0]);
          remaining = remaining.slice(1);
        } else {
          parts.push(remaining.slice(0, nextSpecial));
          remaining = remaining.slice(nextSpecial);
        }
      }

      return parts;
    };

    while (i < lines.length) {
      const line = lines[i];

      // Code Block
      if (line.trim().startsWith("```")) {
        const lang = line.trim().replace(/^```/, "").trim() || "bash";
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const fullCode = codeLines.join("\n");
        const blockIdx = i;

        elements.push(
          <div key={`code-block-${blockIdx}`} className="my-5 rounded-xl border border-border bg-[#030712] overflow-hidden shadow-md font-mono">
            <div className="flex items-center justify-between border-b border-border/80 bg-surface/50 px-4 py-2">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-textSecondary">{lang}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(fullCode, blockIdx)}
                className="flex items-center gap-1.5 text-[10px] text-textSecondary hover:text-textPrimary bg-surfaceHover px-2 py-1 rounded transition-colors"
              >
                {copiedIndex === blockIdx ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs text-textPrimary leading-relaxed overflow-x-auto whitespace-pre font-mono">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Markdown Table
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerCols = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          // line 1 is separator |---|---|
          const bodyRows = tableLines.slice(2).map((row) =>
            row
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-border font-mono text-[11px] text-textPrimary">
                  <tr>
                    {headerCols.map((col, idx) => (
                      <th key={idx} className="px-4 py-2.5 font-semibold uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-[#030712]/50">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-surface/30 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 text-textSecondary font-sans">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Blockquotes / Alerts
      if (line.trim().startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        const fullQuote = quoteLines.join("\n");
        const isWarning = fullQuote.toLowerCase().includes("warn") || fullQuote.toLowerCase().includes("danger") || fullQuote.toLowerCase().includes("rule");

        elements.push(
          <div
            key={`quote-${i}`}
            className={`my-4 rounded-xl border p-4 text-xs ${
              isWarning
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-200"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isWarning ? (
                <ShieldAlert className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="space-y-1 leading-relaxed">{parseInline(fullQuote)}</div>
            </div>
          </div>
        );
        continue;
      }

      // Headings
      if (line.trim().startsWith("### ")) {
        const title = line.replace(/^###\s+/, "");
        elements.push(
          <div key={`h3-${i}`} className="pt-4 pb-2 border-b border-border/50">
            <h3 className="text-base font-bold text-textPrimary tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              {parseInline(title)}
            </h3>
          </div>
        );
        i++;
        continue;
      }

      if (line.trim().startsWith("#### ")) {
        const title = line.replace(/^####\s+/, "");
        elements.push(
          <h4 key={`h4-${i}`} className="pt-3 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
            {parseInline(title)}
          </h4>
        );
        i++;
        continue;
      }

      // Unordered lists (- or *)
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }

        elements.push(
          <ul key={`ul-${i}`} className="my-3 space-y-2 text-xs text-textSecondary">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <div className="leading-relaxed flex-1">{parseInline(item)}</div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered lists (1., 2., 3.)
      if (/^\d+\.\s+/.test(line.trim())) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }

        elements.push(
          <ol key={`ol-${i}`} className="my-3 space-y-2 text-xs text-textSecondary">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-400 font-mono flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="leading-relaxed flex-1">{parseInline(item)}</div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Normal paragraph text
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${i}`} className="my-2.5 text-xs text-textSecondary leading-relaxed">
            {parseInline(line)}
          </p>
        );
      }

      i++;
    }

    return elements;
  };

  return <div className="space-y-1 font-sans">{renderFormattedContent()}</div>;
}
