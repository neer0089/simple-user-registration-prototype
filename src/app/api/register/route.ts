import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createUser, findUserByEmail, toPublicUser } from "@/repositories/user.repository";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<Response> {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = createUser({
    email,
    passwordHash,
    fullName: parsed.data.fullName,
  });

  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
}
