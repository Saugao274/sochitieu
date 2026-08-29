import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  const real = process.env.APP_PASSCODE;

  if (!real || passcode !== real)
    return NextResponse.json({ error: "Mật khẩu chưa đúng" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, real, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return res;
}
