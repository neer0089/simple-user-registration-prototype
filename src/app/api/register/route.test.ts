import bcrypt from "bcryptjs";
import { POST } from "./route";
import { createUser, findUserByEmail, toPublicUser } from "@/repositories/user.repository";

jest.mock("bcryptjs");
jest.mock("@/lib/db", () => ({
  db: {
    exec: jest.fn(),
    pragma: jest.fn(),
    prepare: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));
jest.mock("@/repositories/user.repository");

const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockedFindUserByEmail = findUserByEmail as jest.MockedFunction<typeof findUserByEmail>;
const mockedToPublicUser = toPublicUser as jest.MockedFunction<typeof toPublicUser>;

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 201 for valid registration", async () => {
    mockedFindUserByEmail.mockReturnValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    mockedCreateUser.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hashed-password",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    mockedToPublicUser.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "jane@example.com",
        password: "strongpass",
        fullName: "Jane Doe",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);
    const body = (await response.json()) as { user: { id: string } };

    expect(response.status).toBe(201);
    expect(body.user.id).toBe("user-1");
    expect(bcrypt.hash).toHaveBeenCalledWith("strongpass", 10);
  });

  it("returns 409 for duplicate email", async () => {
    mockedFindUserByEmail.mockReturnValue({
      id: "existing-user",
      email: "jane@example.com",
      passwordHash: "hash",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const request = new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify({
        email: "jane@example.com",
        password: "strongpass",
        fullName: "Jane Doe",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(mockedCreateUser).not.toHaveBeenCalled();
  });
});
