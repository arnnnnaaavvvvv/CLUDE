"use client";

import React from "react";
import { X } from "lucide-react";
import { LoginForm } from "./LoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#080E1A] border border-border p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-surface border border-transparent hover:border-border transition-colors"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <LoginForm isModal onSuccess={onClose} />
      </div>
    </div>
  );
}
