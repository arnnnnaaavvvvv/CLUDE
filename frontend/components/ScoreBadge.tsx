import React from "react";

interface ScoreBadgeProps {
  score: number; // 0.00 to 1.00
  rank?: number;
}

export function ScoreBadge({ score, rank }: ScoreBadgeProps) {
  const percentage = Math.round(score * 100);

  let bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let dotClass = "bg-emerald-400";
  let label = "High Likelihood";

  if (score < 0.5) {
    bgClass = "bg-slate-500/10 text-slate-400 border-slate-500/30";
    dotClass = "bg-slate-400";
    label = "Low Likelihood";
  } else if (score < 0.8) {
    bgClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    dotClass = "bg-amber-400";
    label = "Possible Cause";
  }

  return (
    <div className="flex items-center gap-2">
      {rank !== undefined && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs font-bold text-gray-300 border border-border">
          #{rank}
        </span>
      )}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
        <span>{percentage}% Match</span>
        <span className="text-[10px] opacity-75 font-normal">({label})</span>
      </div>
    </div>
  );
}
