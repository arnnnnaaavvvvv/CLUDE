import { NextResponse } from "next/server";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST = async (req: Request) => {
  try {
    const json = await req.json().catch(() => ({}));
    const parseResult = LoginSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid credentials format", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const name = email.split("@")[0].replace(/[._]/g, " ");
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const user = {
      id: crypto.randomUUID(),
      name: formattedName,
      email: email.toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}&backgroundColor=2563eb,3b82f6`,
      provider: "email",
      role: "Platform Engineer",
      sessionId: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to log in" }, { status: 500 });
  }
};
