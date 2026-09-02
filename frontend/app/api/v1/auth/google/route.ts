import { NextResponse } from "next/server";
import { z } from "zod";

const GoogleAuthSchema = z.object({
  credential: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
});

export const POST = async (req: Request) => {
  try {
    const json = await req.json().catch(() => ({}));
    const parseResult = GoogleAuthSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid Google authentication payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const user = {
      id: crypto.randomUUID(),
      name: data.name || (data.email ? data.email.split("@")[0] : "Google Engineer"),
      email: data.email || "engineer@googlemail.com",
      avatar: data.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      provider: "google",
      role: "Senior Engineer",
      sessionId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to authenticate with Google" }, { status: 500 });
  }
};
