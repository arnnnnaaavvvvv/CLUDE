import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CLUDE | AI Code Intelligence & Root Cause Engine",
  description: "Correlate error traces to git history and generate architectural walkthroughs with LLM reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-primary/30 selection:text-white">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
