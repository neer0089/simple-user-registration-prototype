import { cookies } from "next/headers";
import { findSessionById, deleteExpiredSessions } from "@/repositories/session.repository";
import { findUserById, type UserRecord } from "@/repositories/user.repository";

export const SESSION_COOKIE_NAME = "session_id";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const getAuthenticatedUserFromSessionId = (
  sessionId: string | undefined,
): UserRecord | null => {
  if (!sessionId) {
    return null;
  }

  deleteExpiredSessions();

  const session = findSessionById(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    return null;
  }

  return findUserById(session.userId);
};

export const getAuthenticatedUserFromCookieStore = async (): Promise<UserRecord | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getAuthenticatedUserFromSessionId(sessionId);
};
