import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
}

const mapRowToUserRecord = (row: UserRow): UserRecord => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  fullName: row.full_name,
  bio: row.bio,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const toPublicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const findUserByEmail = (email: string): UserRecord | null => {
  const statement = db.prepare(
    "SELECT * FROM users WHERE email = ? COLLATE NOCASE LIMIT 1",
  );
  const row = statement.get(email) as UserRow | undefined;
  return row ? mapRowToUserRecord(row) : null;
};

export const findUserById = (id: string): UserRecord | null => {
  const statement = db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
  const row = statement.get(id) as UserRow | undefined;
  return row ? mapRowToUserRecord(row) : null;
};

export const createUser = (input: CreateUserInput): UserRecord => {
  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    fullName: input.fullName.trim(),
    bio: null,
    createdAt: now,
    updatedAt: now,
  };

  const statement = db.prepare(
    `INSERT INTO users (id, email, password_hash, full_name, bio, created_at, updated_at)
     VALUES (@id, @email, @passwordHash, @fullName, @bio, @createdAt, @updatedAt)`,
  );
  statement.run(user);

  return user;
};

export interface UpdateProfileInput {
  fullName: string;
  bio: string | null;
}

export const updateUserProfile = (
  userId: string,
  input: UpdateProfileInput,
): UserRecord | null => {
  const now = new Date().toISOString();
  const statement = db.prepare(
    `UPDATE users
     SET full_name = ?, bio = ?, updated_at = ?
     WHERE id = ?`,
  );
  const result = statement.run(input.fullName.trim(), input.bio, now, userId);

  if (result.changes === 0) {
    return null;
  }

  return findUserById(userId);
};
