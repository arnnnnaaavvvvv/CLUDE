"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ArrowRight,
  Copy,
  Check,
  HelpCircle,
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

const PRESET_TOPICS = [
  { label: "Find & Fix Breaking Commits", query: "How do I find the commit that caused an error?" },
  { label: "Attach Error Screenshots", query: "How do I attach a screenshot of an error?" },
  { label: "Connect GitHub Repositories", query: "How do I connect my GitHub repository?" },
  { label: "Understand Unfamiliar Code", query: "How does the Onboarding Guide help me understand code?" },
  { label: "Set Up Sentry Webhooks", query: "How do I set up automated error alerts with Sentry?" },
  { label: "Security & Privacy", query: "Is my code private and safe?" },
];

const BOT_KNOWLEDGE_BASE = [
  {
    keywords: ["find", "fix", "break", "commit", "rca", "root-cause", "error", "crash", "trace"],
    response:
      "Here is how to find and fix breaking errors in 3 simple steps:\n\n1. **Open Root-Cause Studio**: Click 'Launch Studio' in the top menu.\n2. **Paste the Error**: Paste your stack trace, terminal error, or error message.\n3. **Run AI Analysis**: CLUDE automatically finds the exact commit that broke the code, shows who wrote it, explains why it happened in plain English, and gives you a ready-to-copy code fix.",
    actionLink: { label: "Go to Root-Cause Studio", href: "/rca" },
    codeSnippet: `// Example error you can paste\nTypeError: Cannot read properties of undefined (reading 'calculateTax')\n  at PaymentProcessor.processOrder (src/services/payment.ts:142:28)`
  },
  {
    keywords: ["screenshot", "image", "photo", "upload", "attach", "console", "devtools"],
    response:
      "Yes! You can attach screenshots of your screen, console, or error popups:\n\n1. Go to **Root-Cause Studio** (/rca).\n2. In the **Attach Error Screenshot** box, drag and drop or click to upload your image (PNG, JPG, or WEBP).\n3. You'll see a preview of your screenshot.\n4. When you click **Run AI Analysis**, CLUDE reads the text and code from your image and uses it to diagnose the problem.",
    actionLink: { label: "Try Attaching a Screenshot", href: "/rca" }
  },
  {
    keywords: ["connect", "github", "repo", "repository", "token", "access", "private", "public"],
    response:
      "Connecting your repositories takes less than a minute:\n\n1. Click **Connect GitHub** in the top navigation bar or visit **/repos**.\n2. For public repositories, simply search by name (like `facebook/react`).\n3. For private repositories, paste a GitHub Personal Access Token (PAT) with read permissions.\n4. CLUDE indexes the repository structure so you can run analysis and generate diagrams anytime.",
    actionLink: { label: "Connect a Repository", href: "/repos" }
  },
  {
    keywords: ["onboard", "walkthrough", "diagram", "understand", "architecture", "new codebase", "mermaid"],
    response:
      "The **Onboarding Guide** helps you understand any repository quickly:\n\n1. Go to **Onboarding Guide** (/onboarding) and choose a repository.\n2. Click **Generate Walkthrough**.\n3. CLUDE automatically generates:\n   • An interactive visual **system architecture diagram**.\n   • **Core file execution paths** explaining how data flows.\n   • **Danger zones** highlighting complex or high-risk files.\n   • Step-by-step setup instructions for new developers.",
    actionLink: { label: "Open Onboarding Guide", href: "/onboarding" }
  },
  {
    keywords: ["sentry", "webhook", "alert", "automate", "datadog", "slack"],
    response:
      "You can automate error analysis with webhooks:\n\n1. In your Sentry or Datadog project settings, add a webhook pointing to your CLUDE URL.\n2. When an error occurs in production, Sentry automatically sends it to CLUDE.\n3. CLUDE finds the broken commit and suggested fix immediately, sending the solution straight to your Slack channel or PR comments.",
    codeSnippet: `// Webhook endpoint to receive alerts\nPOST /api/v1/rca/analyze\nPayload: { "event_id": "...", "exception": { "values": [...] } }`
  },
  {
    keywords: ["security", "privacy", "safe", "store", "retain", "data", "confidential"],
    response:
      "Your code security and privacy are 100% protected:\n\n• **Zero Code Retention**: Your source code is never permanently stored on external servers. It is analyzed in temporary memory and immediately cleared.\n• **Read-Only Access**: CLUDE only reads commit changes and file structure.\n• **Private Deployment**: Enterprise teams can run CLUDE entirely inside their own private cloud (VPC) with local private models.",
    actionLink: { label: "View Connected Repos", href: "/repos" }
  },
];

// Helper to render simple formatted text with bolding and bullet points
function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }

        // Render bullet items cleanly
        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
        const cleanLine = isBullet ? line.trim().replace(/^[•\-]\s*/, "") : line;

        // Parse bold **text** segments
        const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

        return (
          <div key={idx} className={isBullet ? "flex items-start gap-2 pl-2" : ""}>
            {isBullet && <span className="text-blue-400 font-bold">•</span>}
            <p className="leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={pIdx} className="font-semibold text-textPrimary">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={pIdx}>{part}</span>;
              })}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function HelpChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your **CLUDE Assistant**. How can I help you today? You can ask me how to fix errors, attach screenshots, or connect your repositories.",
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

    setTimeout(() => {
      const lower = text.toLowerCase();
      let match = BOT_KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => lower.includes(kw))
      );

      if (!match) {
        match = {
          keywords: [],
          response:
            "I can help with any of these common tasks:\n\n• **Fix Broken Commits**: Paste an error in Root-Cause Studio (/rca).\n• **Attach Screenshots**: Drag and drop an image of your error into /rca.\n• **Understand Code**: Generate system maps and walkthroughs in /onboarding.\n• **Connect GitHub**: Add public or private projects in /repos.\n\nClick any topic below or ask another question!",
          actionLink: { label: "Go to Studio", href: "/rca" },
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
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "Hello! I am your **CLUDE Assistant**. How can I help you today? You can ask me how to fix errors, attach screenshots, or connect your repositories.",
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
    <div className="rounded-2xl border border-white/10 bg-[#080E1B] shadow-2xl flex flex-col overflow-hidden font-sans">
      {/* Sleek Minimalist Header */}
      <div className="px-6 py-4 bg-[#0B1528] border-b border-border/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-textPrimary">CLUDE Support Assistant</h3>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Online
              </span>
            </div>
            <p className="text-xs text-textSecondary">Ask any question to learn how to use CLUDE</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary bg-surface hover:bg-surfaceHover px-3 py-1.5 rounded-lg border border-border transition-colors"
          title="Start a new conversation"
        >
          <RotateCcw className="h-3 w-3" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Clean Quick Topic Suggestions */}
      <div className="px-6 py-3 bg-[#060B14] border-b border-border/50 flex flex-wrap items-center gap-2">
        <span className="text-xs text-textSecondary font-medium mr-1">Popular questions:</span>
        {PRESET_TOPICS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.query)}
            className="text-xs rounded-full bg-surface hover:bg-surfaceHover text-textSecondary hover:text-textPrimary px-3 py-1 border border-border hover:border-blue-500/40 transition-all shadow-sm"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="p-6 overflow-y-auto max-h-[460px] min-h-[320px] space-y-4 bg-[#040812]">
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
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 shadow-md ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-[#091120] border border-border text-textSecondary rounded-tl-none"
              }`}
            >
              <FormattedMessageText text={msg.text} />

              {/* Code Snippet if present */}
              {msg.codeSnippet && (
                <div className="rounded-xl border border-border bg-[#02050D] p-3 font-mono text-[11px] text-sky-300 relative group overflow-x-auto mt-2">
                  <button
                    onClick={() => handleCopyCode(msg.codeSnippet!, msg.id)}
                    className="absolute right-2 top-2 p-1 rounded bg-surface border border-border text-textSecondary hover:text-white transition-colors"
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

              {/* Action Button */}
              {msg.actionLink && (
                <div className="pt-1">
                  <Link
                    href={msg.actionLink.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 font-semibold text-xs transition-all group"
                  >
                    <span>{msg.actionLink.label}</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              <div
                className={`text-[10px] pt-1 text-right ${
                  msg.sender === "user" ? "text-blue-200/70" : "text-textSecondary/50"
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
            <div className="rounded-2xl rounded-tl-none bg-[#091120] border border-border p-3.5 flex items-center gap-1.5 text-textSecondary text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-textSecondary/70 text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0B1528] border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 rounded-xl border border-border bg-[#030712] px-4 py-3 text-xs text-textPrimary placeholder-textSecondary/60 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex items-center justify-center h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all gap-1.5 flex-shrink-0"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
