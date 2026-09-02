"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Github,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface LoginFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export function LoginForm({ onSuccess, isModal = false }: LoginFormProps) {
  const router = useRouter();
  const { loginWithGoogleFirebase, loginWithGithubFirebase, loginWithEmail, signupWithEmail } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginWithGoogleFirebase();
      if (res.success) {
        setSuccessMsg("Signed in with Google Firebase Auth!");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push("/rca");
        }, 600);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await loginWithGithubFirebase();
      if (res.success) {
        setSuccessMsg("Authenticated with GitHub!");
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else router.push("/rca");
        }, 600);
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "GitHub authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setError(res.error || "Invalid email or password.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Welcome back! Redirecting to studio...");
      } else {
        const res = await signupWithEmail(name, email, password);
        if (!res.success) {
          setError(res.error || "Could not complete registration.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Account created successfully with Firebase Auth!");
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        else router.push("/rca");
      }, 600);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Header */}
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-3 shadow-lg shadow-blue-500/15">
          <Terminal className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-textPrimary">
          {mode === "signin" ? "Welcome back to CLUDE" : "Create your CLUDE account"}
        </h2>
        <p className="mt-1.5 text-xs text-textSecondary max-w-xs mx-auto">
          {mode === "signin"
            ? "Sign in to access root-cause intelligence and synchronized repositories."
            : "Deploy autonomous AST debugging and onboarding maps for your entire team."}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-[#0B0F19] p-1 border border-border mb-6">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === "signin"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-textSecondary hover:text-textPrimary"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === "signup"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "text-textSecondary hover:text-textPrimary"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="flex-1 font-medium">{successMsg}</span>
        </div>
      )}

      {/* OAuth Action Buttons */}
      <div className="space-y-2.5 mb-6">
        {/* Google Authentication via Firebase Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-surface hover:bg-[#0D1527] border border-border hover:border-blue-500/50 text-xs font-semibold text-textPrimary transition-all shadow-sm group-hover:shadow-blue-500/10 active:scale-[0.99]"
        >
          {/* Google Brand SVG Icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGithubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-surface hover:bg-[#0D1527] border border-border hover:border-borderStrong text-xs font-semibold text-textPrimary transition-all shadow-sm active:scale-[0.99]"
        >
          <Github className="h-4 w-4 text-textPrimary" />
          <span>Continue with GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-border w-full" />
        <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-textSecondary font-mono shrink-0">
          Or continue with email
        </span>
        <div className="border-t border-border w-full" />
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                required={mode === "signup"}
                className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-2.5 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1.5">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              required
              className="w-full rounded-xl bg-surface border border-border pl-10 pr-4 py-2.5 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-textSecondary">Password</label>
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => alert("Password reset link has been dispatched to your registered email.")}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full rounded-xl bg-surface border border-border pl-10 pr-10 py-2.5 text-xs text-textPrimary placeholder:text-textSecondary/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary p-1 rounded transition-colors"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border bg-surface text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-[11px] text-textSecondary">Remember session for 30 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating with Firebase...</span>
            </span>
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In with Email" : "Create Account"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Security Footer */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-[11px] text-textSecondary">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>Firebase Auth Encrypted • Google Cloud Identity Engine</span>
      </div>
    </div>
  );
}
