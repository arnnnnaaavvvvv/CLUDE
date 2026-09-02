"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "github" | "email";
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogleToken: (credential: string) => Promise<boolean>;
  loginWithGoogleQuick: (demoData?: Partial<AuthUser>) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGithub: (profile: { username: string; avatar_url: string; name?: string | null }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to decode JWT payload from Google credential token
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("clude_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Check if legacy github profile exists
        const ghProfile = localStorage.getItem("clude_github_profile");
        if (ghProfile) {
          const gh = JSON.parse(ghProfile);
          setUser({
            id: gh.username || "gh-user",
            name: gh.name || gh.username,
            email: `${gh.username}@github.user`,
            avatar: gh.avatar_url,
            provider: "github",
            role: "GitHub Developer",
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (e) {
      console.warn("Could not read auth user from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem("clude_auth_user", JSON.stringify(newUser));
  };

  const loginWithGoogleToken = async (credential: string): Promise<boolean> => {
    const payload = parseJwt(credential);
    if (!payload || !payload.email) {
      return false;
    }

    const newUser: AuthUser = {
      id: payload.sub || crypto.randomUUID(),
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      avatar: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${payload.email}`,
      provider: "google",
      role: "Software Engineer",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return true;
  };

  const loginWithGoogleQuick = async (demoData?: Partial<AuthUser>): Promise<boolean> => {
    const defaultGoogleUser: AuthUser = {
      id: crypto.randomUUID(),
      name: demoData?.name || "Alex Rivera",
      email: demoData?.email || "alex.rivera@googlemail.com",
      avatar:
        demoData?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      provider: "google",
      role: "Senior Systems Engineer",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(defaultGoogleUser);
    return true;
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const name = email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: formattedName,
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}&backgroundColor=2563eb,3b82f6`,
      provider: "email",
      role: "Platform Engineer",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return { success: true };
  };

  const signupWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Please enter your full name." };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0284c7,3b82f6`,
      provider: "email",
      role: "DevOps / Reliability Lead",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return { success: true };
  };

  const loginWithGithub = async (profile: {
    username: string;
    avatar_url: string;
    name?: string | null;
  }): Promise<boolean> => {
    const newUser: AuthUser = {
      id: profile.username,
      name: profile.name || profile.username,
      email: `${profile.username}@users.noreply.github.com`,
      avatar: profile.avatar_url,
      provider: "github",
      role: "Core Contributor",
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("clude_auth_user");
    localStorage.removeItem("clude_github_profile");
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "103847291823-mockclientid.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider
        value={{
          user,
          isLoading,
          loginWithGoogleToken,
          loginWithGoogleQuick,
          loginWithEmail,
          signupWithEmail,
          loginWithGithub,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
