import bcrypt from "bcryptjs";
import { POST } from "./route";
import { createSession } from "@/repositories/session.repository";
import { findUserByEmail, toPublicUser } from "@/repositories/user.repository";

jest.mock("bcryptjs");
jest.mock("@/lib/db", () => ({
  db: {
    exec: jest.fn(),
    pragma: jest.fn(),
    prepare: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));
jest.mock("@/repositories/session.repository");
jest.mock("@/repositories/user.repository");

const mockedCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockedFindUserByEmail = findUserByEmail as jest.MockedFunction<typeof findUserByEmail>;
const mockedToPublicUser = toPublicUser as jest.MockedFunction<typeof toPublicUser>;

describe("POST /api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates session and sets cookie for valid credentials", async () => {
    mockedFindUserByEmail.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hashed",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockedCreateSession.mockReturnValue({
      id: "session-1",
      userId: "user-1",
      expiresAt: Date.now() + 1000,
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    mockedToPublicUser.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "jane@example.com", password: "strongpass" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("session_id=session-1");
  });

  it("returns 401 for invalid password", async () => {
    mockedFindUserByEmail.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hashed",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "jane@example.com", password: "wrongpass" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(mockedCreateSession).not.toHaveBeenCalled();
  });
});
