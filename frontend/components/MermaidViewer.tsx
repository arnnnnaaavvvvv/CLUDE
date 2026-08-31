"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidViewerProps {
  chart: string;
}

export function MermaidViewer({ chart }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#0b0f17",
        primaryColor: "#6366f1",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#818cf8",
        lineColor: "#64748b",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
      },
    });

    if (containerRef.current && chart) {
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((err) => {
          console.error("Mermaid rendering failed:", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<pre class="text-xs text-gray-400 p-4">${chart}</pre>`;
          }
        });
    }
  }, [chart]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 overflow-x-auto flex justify-center items-center min-h-[220px]">
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}
