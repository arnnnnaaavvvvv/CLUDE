import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    status: "healthy",
    service: "clude-web",
    timestamp: Date.now() / 1000,
  });
};
