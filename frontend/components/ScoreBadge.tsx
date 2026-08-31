import React from "react";

interface ScoreBadgeProps {
  score: number; // 0.00 to 1.00
  rank?: number;
}

export function ScoreBadge({ score, rank }: ScoreBadgeProps) {
  const percentage = Math.round(score * 100);

  let bgClass = "bg-blue-500/15 text-blue-400 border-blue-500/30";
  let dotClass = "bg-blue-400";
  let label = "High Likelihood";

  if (score < 0.5) {
    bgClass = "bg-slate-500/15 text-slate-400 border-slate-500/30";
    dotClass = "bg-slate-400";
    label = "Low Likelihood";
  } else if (score < 0.8) {
    bgClass = "bg-sky-500/15 text-sky-400 border-sky-500/30";
    dotClass = "bg-sky-400";
    label = "Plausible Cause";
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      {rank !== undefined && (
        <span className="flex h-5 w-5 items-center justify-center rounded bg-surfaceHover text-[11px] font-bold text-textPrimary border border-border">
          #{rank}
        </span>
      )}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass} animate-pulse`} />
        <span>{percentage}% Match</span>
        <span className="text-[10px] opacity-75 font-normal">({label})</span>
      </div>
    </div>
  );
}
