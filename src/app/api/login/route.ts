import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/repositories/session.repository";
import { findUserByEmail, toPublicUser } from "@/repositories/user.repository";

export async function POST(request: Request): Promise<Response> {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const user = findUserByEmail(parsed.data.email.trim().toLowerCase());
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValidPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = createSession(user.id, SESSION_TTL_MS);
  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: session.id,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });

  return response;
}
