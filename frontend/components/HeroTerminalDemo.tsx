"use client";

import React, { useState, useEffect } from "react";
import { Terminal, GitCommit, Sparkles, Check, ArrowRight, Play, RotateCcw, AlertTriangle } from "lucide-react";

interface IncidentScenario {
  id: string;
  name: string;
  lang: string;
  errorHeader: string;
  traceLines: string[];
  commitSha: string;
  commitMsg: string;
  commitAuthor: string;
  commitDate: string;
  confidence: number;
  filePath: string;
  diffLines: { type: "context" | "del" | "add" | "hunk"; text: string }[];
  reasoning: string;
}

const SCENARIOS: IncidentScenario[] = [
  {
    id: "ts-tax",
    name: "TypeScript • TypeError",
    lang: "ts",
    errorHeader: "TypeError: Cannot read properties of undefined (reading 'calculateTax')",
    traceLines: [
      "    at PaymentProcessor.processOrder (src/services/payment.ts:142:28)",
      "    at CheckoutController.handleCheckout (src/controllers/checkout.ts:89:12)",
      "    at Layer.handle [as handle_request] (express/lib/router/layer.js:95:5)",
    ],
    commitSha: "a1f4c39e",
    commitMsg: "refactor(tax): extract tax calculation logic into dynamic provider",
    commitAuthor: "alex@company.com",
    commitDate: "Yesterday at 18:22",
    confidence: 94,
    filePath: "src/services/payment.ts",
    diffLines: [
      { type: "hunk", text: "@@ -139,5 +139,5 @@ class PaymentProcessor {" },
      { type: "context", text: "   public async processOrder(order: Order): Promise<Receipt> {" },
      { type: "del", text: "-    const tax = this.taxProvider ? this.taxProvider.calculateTax(order) : 0;" },
      { type: "add", text: "+    const tax = this.taxProvider.calculateTax(order); // Unsafe: taxProvider may be uninitialized" },
      { type: "context", text: "     const total = order.subtotal + tax;" },
    ],
    reasoning:
      "Commit a1f4c39 removed the inline fallback guard around this.taxProvider without ensuring asynchronous initialization completed in processOrder, inducing the undefined reference at line 142.",
  },
  {
    id: "py-billing",
    name: "Python • AttributeError",
    lang: "py",
    errorHeader: "AttributeError: 'NoneType' object has no attribute 'get_discounted_rate'",
    traceLines: [
      "  File \"app/services/billing.py\", line 87, in process_subscription",
      "    charge_amount = plan.get_discounted_rate(user.tier)",
      "  File \"app/api/routers/billing.py\", line 34, in subscribe_endpoint",
    ],
    commitSha: "c82b109f",
    commitMsg: "feat(plans): decouple custom enterprise tier from default plan lookup",
    commitAuthor: "sarah@company.com",
    commitDate: "2 days ago",
    confidence: 91,
    filePath: "app/services/billing.py",
    diffLines: [
      { type: "hunk", text: "@@ -84,4 +84,4 @@ def process_subscription(user: User):" },
      { type: "context", text: "     plan = PlanRegistry.get_plan(user.plan_id)" },
      { type: "del", text: "-    plan = plan or PlanRegistry.get_default()" },
      { type: "add", text: "+    # Removed default fallback to allow strict enterprise tier enforcement" },
      { type: "context", text: "     charge_amount = plan.get_discounted_rate(user.tier)" },
    ],
    reasoning:
      "Commit c82b109 removed the fallback default plan resolution when user.plan_id is missing or custom, causing 'plan' to evaluate to None at line 87.",
  },
  {
    id: "go-panic",
    name: "Go • Nil Pointer Panic",
    lang: "go",
    errorHeader: "panic: runtime error: invalid memory address or nil pointer dereference",
    traceLines: [
      "goroutine 1 [running]:",
      "main.DispatchWorker(0x0, 0x1400011c000)",
      "\t/src/workers/dispatcher.go:73 +0x3c",
      "main.main()",
      "\t/src/main.go:24 +0x88",
    ],
    commitSha: "4e91dc3a",
    commitMsg: "perf(queue): parallelize worker dispatch channels",
    commitAuthor: "devin@company.com",
    commitDate: "3 days ago",
    confidence: 88,
    filePath: "src/workers/dispatcher.go",
    diffLines: [
      { type: "hunk", text: "@@ -70,3 +70,3 @@ func DispatchWorker(cfg *Config, ch chan Job) {" },
      { type: "context", text: "     for job := range ch {" },
      { type: "del", text: "-        if cfg != nil && cfg.MetricsEnabled {" },
      { type: "add", text: "+        if cfg.MetricsEnabled { // Panic if caller passes nil cfg" },
      { type: "context", text: "             cfg.Record(job.ID)" },
    ],
    reasoning:
      "Commit 4e91dc3 removed the nil-check guard on the *Config pointer parameter inside DispatchWorker loop, triggering a segmentation violation at line 73.",
  },
];

export function HeroTerminalDemo() {
  const [selectedScenario, setSelectedScenario] = useState<IncidentScenario>(SCENARIOS[0]);
  const [typedChars, setTypedChars] = useState<number>(0);
  const [step, setStep] = useState<"typing" | "parsing" | "ranked">("ranked");
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [visibleDiffLines, setVisibleDiffLines] = useState<number>(0);

  const fullTraceText = `${selectedScenario.errorHeader}\n${selectedScenario.traceLines.join("\n")}`;

  const playDemo = () => {
    setStep("typing");
    setTypedChars(0);
    setAnimatedScore(0);
    setVisibleDiffLines(0);
  };

  useEffect(() => {
    if (step === "typing") {
      if (typedChars < fullTraceText.length) {
        const timeout = setTimeout(() => {
          setTypedChars((prev) => Math.min(prev + 4, fullTraceText.length));
        }, 12);
        return () => clearTimeout(timeout);
      } else {
        setStep("parsing");
        const timeout = setTimeout(() => {
          setStep("ranked");
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [step, typedChars, fullTraceText]);

  useEffect(() => {
    if (step === "ranked") {
      let current = 0;
      const target = selectedScenario.confidence;
      const interval = setInterval(() => {
        current += 3;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 15);

      let lineIdx = 0;
      const total = selectedScenario.diffLines.length;
      const diffInterval = setInterval(() => {
        lineIdx += 1;
        setVisibleDiffLines(lineIdx);
        if (lineIdx >= total) {
          clearInterval(diffInterval);
        }
      }, 80);

      return () => {
        clearInterval(interval);
        clearInterval(diffInterval);
      };
    }
  }, [step, selectedScenario]);

  return (
    <div className="rounded-xl lg:rounded-2xl border border-border bg-[#080E1A] shadow-2xl overflow-hidden text-left font-sans">
      {/* Top Terminal Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#050A14] border-b border-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-textSecondary ml-2 text-[11px] flex items-center gap-1.5">
            <Terminal className="h-3 w-3 text-blue-400" />
            <span>clude --trace --correlate</span>
          </span>
        </div>

        {/* Scenario Selector & Replay */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#080E1A] rounded-lg p-0.5 border border-border">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedScenario(s);
                  setStep("ranked");
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
                  selectedScenario.id === s.id
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                {s.name.split(" • ")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={playDemo}
            className="flex items-center gap-1 text-[11px] text-textSecondary hover:text-textPrimary px-2.5 py-1 rounded-md hover:bg-surfaceHover border border-border transition-colors font-mono"
            title="Replay live typing animation"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stack Trace Ingest & Causal Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Left: Input Error Log */}
        <div className="lg:col-span-5 p-5 bg-[#030712] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-textSecondary mb-2 uppercase tracking-wider">
              <span>Ingested Stack Trace</span>
              <span className="text-blue-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                Active Incident
              </span>
            </div>

            <div className="font-mono text-xs text-textPrimary leading-relaxed bg-[#080E1A]/80 p-3.5 rounded-xl border border-border min-h-[150px] overflow-x-auto whitespace-pre">
              {step === "typing" ? (
                <>
                  <span className="text-rose-400 font-semibold">{fullTraceText.substring(0, typedChars)}</span>
                  <span className="inline-block w-1.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse" />
                </>
              ) : (
                <div className="space-y-1">
                  <div className="text-rose-400 font-semibold text-[11px]">{selectedScenario.errorHeader}</div>
                  <div className="text-textSecondary text-[11px] space-y-0.5">
                    {selectedScenario.traceLines.map((line, idx) => (
                      <div key={idx} className={line.includes(selectedScenario.filePath) ? "text-blue-400 font-medium" : ""}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slicing State */}
          <div className="text-[11px] font-mono text-textSecondary flex items-center justify-between pt-2 border-t border-border/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
              <span>AST Coordinate: {selectedScenario.filePath}:142</span>
            </span>
            <span className="text-blue-400 font-semibold">14-day history</span>
          </div>
        </div>

        {/* Right: Ranked Causal Result */}
        <div className="lg:col-span-7 p-5 bg-[#080E1A] flex flex-col justify-between space-y-4">
          <div>
            {/* Header: Commit & Score Bar */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400">#{selectedScenario.commitSha}</span>
                  <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase font-semibold">
                    Rank 1 (Causal Cause)
                  </span>
                </div>
                <div className="text-xs font-semibold text-textPrimary mt-1.5">
                  "{selectedScenario.commitMsg}"
                </div>
                <div className="text-[10px] font-mono text-textSecondary mt-0.5">
                  {selectedScenario.commitAuthor} &bull; {selectedScenario.commitDate}
                </div>
              </div>

              {/* Animated Confidence Score */}
              <div className="flex flex-col items-end min-w-[120px]">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-400">
                  <span>{animatedScore}%</span>
                  <span className="text-[10px] text-textSecondary font-normal">Likelihood</span>
                </div>
                {/* Confidence Bar */}
                <div className="w-full h-1.5 bg-[#0F172A] rounded-full mt-1.5 overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${animatedScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Line-by-Line Code Diff */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-textSecondary mb-1">
                <span className="text-textPrimary">{selectedScenario.filePath}</span>
                <span>Diff Hunk</span>
              </div>
              <div className="font-mono text-[11px] leading-relaxed bg-[#030712] rounded-xl border border-border p-3 overflow-x-auto">
                {selectedScenario.diffLines.slice(0, visibleDiffLines).map((d, idx) => {
                  let textStyle = "text-textSecondary";
                  let bgStyle = "";
                  if (d.type === "del") {
                    textStyle = "text-rose-400";
                    bgStyle = "bg-rose-950/30";
                  } else if (d.type === "add") {
                    textStyle = "text-blue-300 font-medium";
                    bgStyle = "bg-blue-950/40 border-l-2 border-blue-400";
                  } else if (d.type === "hunk") {
                    textStyle = "text-textSecondary/70 italic text-[10px]";
                  }

                  return (
                    <div key={idx} className={`px-2 py-0.5 rounded-sm whitespace-pre ${bgStyle} ${textStyle}`}>
                      {d.text}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Causal Reasoning */}
            <div className="bg-[#030712]/90 rounded-xl p-3.5 border border-border">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Plain-English Reasoning:</span>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed">
                {selectedScenario.reasoning}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] font-mono text-textSecondary">
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Remediation Fix Available
            </span>
            <span>Reasoned with Claude 3.5 Sonnet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
