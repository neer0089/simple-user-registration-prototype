import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromSessionId, SESSION_COOKIE_NAME } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validation";
import { toPublicUser, updateUserProfile } from "@/repositories/user.repository";

const unauthorizedResponse = () =>
  NextResponse.json({ error: "Unauthorized." }, { status: 401 });

export async function GET(request: NextRequest): Promise<Response> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = getAuthenticatedUserFromSessionId(sessionId);

  if (!user) {
    return unauthorizedResponse();
  }

  return NextResponse.json({ user: toPublicUser(user) });
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const currentUser = getAuthenticatedUserFromSessionId(sessionId);

  if (!currentUser) {
    return unauthorizedResponse();
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile payload." }, { status: 400 });
  }

  const updatedUser = updateUserProfile(currentUser.id, {
    fullName: parsed.data.fullName,
    bio: parsed.data.bio,
  });

  if (!updatedUser) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ user: toPublicUser(updatedUser) });
}
