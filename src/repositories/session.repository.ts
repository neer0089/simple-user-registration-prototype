import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: number;
  created_at: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: string;
}

const mapSessionRow = (row: SessionRow): SessionRecord => ({
  id: row.id,
  userId: row.user_id,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
});

export const createSession = (userId: string, ttlMs: number): SessionRecord => {
  const createdAt = new Date().toISOString();
  const expiresAt = Date.now() + ttlMs;
  const session: SessionRecord = {
    id: randomUUID(),
    userId,
    expiresAt,
    createdAt,
  };

  const statement = db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, created_at)
     VALUES (@id, @userId, @expiresAt, @createdAt)`,
  );
  statement.run(session);

  return session;
};

export const findSessionById = (sessionId: string): SessionRecord | null => {
  const statement = db.prepare("SELECT * FROM sessions WHERE id = ? LIMIT 1");
  const row = statement.get(sessionId) as SessionRow | undefined;
  return row ? mapSessionRow(row) : null;
};

export const deleteSessionById = (sessionId: string): void => {
  const statement = db.prepare("DELETE FROM sessions WHERE id = ?");
  statement.run(sessionId);
};

export const deleteExpiredSessions = (): void => {
  const statement = db.prepare("DELETE FROM sessions WHERE expires_at <= ?");
  statement.run(Date.now());
};
