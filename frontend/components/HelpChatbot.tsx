"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Bug,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Code,
  Terminal,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    href: string;
  };
  codeSnippet?: string;
}

const PRESET_QUESTIONS = [
  "How do I run a Root-Cause Analysis?",
  "How do I attach an error screenshot?",
  "How do I connect my GitHub repository?",
  "How does the AI Onboarding Guide work?",
  "How do Sentry webhooks work in CLUDE?",
  "Is my source code stored or retained?",
];

const BOT_KNOWLEDGE_BASE: { keywords: string[]; response: string; actionLink?: { label: string; href: string }; codeSnippet?: string }[] = [
  {
    keywords: ["root-cause", "rca", "trace", "error", "analysis", "crash"],
    response: "To run a Root-Cause Analysis in CLUDE:\n\n1. Go to **Root-Cause Studio** (/rca).\n2. Select your connected repository from the dropdown.\n3. Paste the stack trace, runtime error log, or error message (supports JS/TS, Python, Go, Java).\n4. *(Optional)* Drag and drop an error screenshot to give multimodal visual context.\n5. Click **Run AI Root-Cause Analysis**.\n\nCLUDE parses the stack coordinates, correlates the AST git commit graph, and presents the ranked causal commits, committer profile, plain-English reasoning, and exact copyable fix snippet!",
    actionLink: { label: "Open Root-Cause Studio", href: "/rca" },
    codeSnippet: `// Example TypeScript Error\nTypeError: Cannot read properties of undefined (reading 'calculateTax')\n  at PaymentProcessor.processOrder (src/services/payment.ts:142:28)`
  },
  {
    keywords: ["screenshot", "image", "upload", "attach", "multimodal", "vision"],
    response: "You can attach error screenshots directly in the Root-Cause Studio:\n\n1. In **/rca**, look at the **Attach Error Screenshot** dropzone.\n2. Click or drag-and-drop any PNG, JPG, or WEBP image (such as a browser DevTools console, Sentry incident page, or terminal output).\n3. You will see an instant thumbnail preview with image dimensions.\n4. When you click **Run AI Root-Cause Analysis**, CLUDE's multimodal vision engine extracts visual error codes and integrates them into the causal bisection graph.",
    actionLink: { label: "Try Screenshot Ingestion", href: "/rca" }
  },
  {
    keywords: ["connect", "github", "repo", "repository", "token", "private"],
    response: "To connect repositories to CLUDE:\n\n1. Click **Connect GitHub** in the top navbar or visit the **Repositories** page (/repos).\n2. Enter your GitHub Personal Access Token (PAT) with `repo` or `public_repo` read scopes, or search any public repository.\n3. CLUDE fetches the latest commits, file structure, and builds 1536-dimensional semantic vector embeddings.\n4. Once indexed, you can run instant RCA and generate architecture guides!",
    actionLink: { label: "Go to Repositories", href: "/repos" },
    codeSnippet: `# Clone or connect via CLUDE\nPOST /api/v1/repos/connect\n{\n  "full_name": "owner/repository",\n  "default_branch": "main"\n}`
  },
  {
    keywords: ["onboarding", "walkthrough", "mermaid", "architecture", "diagram", "danger"],
    response: "The AI Onboarding Guide synthesizes entire repositories into interactive architectural walkthroughs:\n\n1. Navigate to **Onboarding Guide** (/onboarding).\n2. Select your repository and click **Generate Walkthrough**.\n3. CLUDE automatically constructs:\n   • Interactive **Mermaid.js architecture topologies**.\n   • **Critical Execution Paths** (core controllers, services, database models).\n   • **Danger Zones & Churn Hotspots** (high-risk concurrency files and frequent bug zones).\n   • **Step-by-Step Developer Setup Guides**.",
    actionLink: { label: "Open Onboarding Guide", href: "/onboarding" }
  },
  {
    keywords: ["sentry", "webhook", "datadog", "slack", "alert", "trigger"],
    response: "CLUDE can automatically triage production incidents in real time via webhooks:\n\n1. In your Sentry or Datadog alerts settings, configure a webhook endpoint pointing to `https://your-clude-instance.dev/api/v1/webhooks/sentry`.\n2. When an exception occurs, the webhook payload is parsed by CLUDE.\n3. CLUDE executes automated bisection and sends a Slack notification or PR comment with the exact root-cause commit and proposed fix!",
    codeSnippet: `// Webhook Payload Trigger\nPOST /api/v1/rca/analyze\nHeaders: X-Sentry-Signature\nBody: { "event_id": "...", "exception": { "values": [...] } }`
  },
  {
    keywords: ["security", "privacy", "retain", "soc2", "retention", "stored"],
    response: "Security & Privacy Guarantee:\n\n• **Zero Raw Code Retention**: CLUDE processes code AST diffs in ephemeral memory. Your proprietary source code is never permanently stored on external servers.\n• **Read-Only Permissions**: CLUDE only requires read permissions to analyze commit diffs and build vector indexes.\n• **Air-Gapped & VPC Deployable**: For enterprise deployments, CLUDE can run entirely inside your private VPC with local Ollama/vLLM endpoints.",
    actionLink: { label: "View Repositories", href: "/repos" }
  },
];

export function HelpChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "👋 Hi there! I'm your **CLUDE AI Guide**. Ask me anything about how to use the platform, analyze error traces, attach screenshots, connect repositories, or explore architecture walkthroughs.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // AI Response generation based on knowledge base
    setTimeout(() => {
      const lower = text.toLowerCase();
      let match = BOT_KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => lower.includes(kw))
      );

      if (!match) {
        match = {
          keywords: [],
          response: `I'd love to help with that! In CLUDE, you can:\n\n• **Pinpoint Breaking Commits**: Paste stack traces or drop error screenshots in the **Root-Cause Studio** (/rca).\n• **Accelerate Onboarding**: Generate system diagrams and critical path guides in the **Onboarding Guide** (/onboarding).\n• **Manage Repositories**: Connect public and private GitHub repositories in **Repositories** (/repos).\n\nFeel free to click any of the suggested topics below or ask a more specific question!`,
          actionLink: { label: "Explore RCA Studio", href: "/rca" }
        };
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: match.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionLink: match.actionLink,
        codeSnippet: match.codeSnippet,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "👋 Hi there! I'm your **CLUDE AI Guide**. Ask me anything about how to use the platform, analyze error traces, attach screenshots, connect repositories, or explore architecture walkthroughs.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCopyCode = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-blue-500/30 bg-[#070D18] shadow-2xl flex flex-col overflow-hidden font-sans">
      {/* Chatbot Header */}
      <div className="px-5 py-4 bg-[#0B1528] border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#0B1528]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-textPrimary">CLUDE AI Assistant</h3>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Interactive Tutor
              </span>
            </div>
            <p className="text-[11px] text-textSecondary font-mono">
              Ask any question about using CLUDE
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1 text-[11px] font-mono text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover px-2.5 py-1 rounded-lg border border-border transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-3 bg-[#050A14] border-b border-border/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary flex-shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Quick Prompts:</span>
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="flex-shrink-0 text-[11px] font-mono bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary px-2.5 py-1 rounded-lg border border-border/80 transition-all hover:border-blue-500/40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="p-5 overflow-y-auto max-h-[480px] min-h-[340px] space-y-4 bg-[#030712]/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {msg.sender === "bot" ? (
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none"
                  : "bg-surface border border-border text-textPrimary rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Code Snippet if applicable */}
              {msg.codeSnippet && (
                <div className="rounded-xl border border-border bg-[#02050D] p-3 font-mono text-[11px] text-sky-300 relative group overflow-x-auto mt-2">
                  <button
                    onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                    className="absolute right-2 top-2 p-1 rounded bg-surface border border-border text-textSecondary hover:text-white"
                    title="Copy code"
                  >
                    {copiedCodeId === msg.id ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <pre className="pr-6">{msg.codeSnippet}</pre>
                </div>
              )}

              {/* Action Link if applicable */}
              {msg.actionLink && (
                <div className="pt-1">
                  <Link
                    href={msg.actionLink.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 font-semibold text-[11px] transition-all group"
                  >
                    <span>{msg.actionLink.label}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              <div
                className={`text-[10px] font-mono pt-1 text-right ${
                  msg.sender === "user" ? "text-blue-200/70" : "text-textSecondary/60"
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-surface border border-border p-3 flex items-center gap-1.5 text-textSecondary text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span className="font-mono text-[11px] ml-1 text-textSecondary">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0B1528] border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything (e.g. 'How do I bisect an error commit?' or 'Explain onboarding diagrams')..."
            className="flex-1 rounded-xl border border-border bg-[#030712] px-4 py-2.5 text-xs text-textPrimary placeholder-textSecondary/50 focus:border-blue-500 focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition-all flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
