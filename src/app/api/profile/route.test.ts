import { NextRequest } from "next/server";
import { GET, PATCH } from "./route";
import { getAuthenticatedUserFromSessionId } from "@/lib/auth";
import { toPublicUser, updateUserProfile } from "@/repositories/user.repository";

jest.mock("@/lib/db", () => ({
  db: {
    exec: jest.fn(),
    pragma: jest.fn(),
    prepare: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}));
jest.mock("@/lib/auth");
jest.mock("@/repositories/user.repository");

const mockedGetAuthenticatedUserFromSessionId =
  getAuthenticatedUserFromSessionId as jest.MockedFunction<
    typeof getAuthenticatedUserFromSessionId
  >;
const mockedUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>;
const mockedToPublicUser = toPublicUser as jest.MockedFunction<typeof toPublicUser>;

describe("/api/profile route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 for unauthenticated GET", async () => {
    mockedGetAuthenticatedUserFromSessionId.mockReturnValue(null);
    const request = new NextRequest("http://localhost/api/profile");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("returns profile for authenticated GET", async () => {
    mockedGetAuthenticatedUserFromSessionId.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hash",
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

    const request = new NextRequest("http://localhost/api/profile", {
      headers: { cookie: "session_id=session-1" },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("updates profile on authenticated PATCH", async () => {
    mockedGetAuthenticatedUserFromSessionId.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hash",
      fullName: "Jane Doe",
      bio: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    mockedUpdateUserProfile.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      passwordHash: "hash",
      fullName: "Jane Updated",
      bio: "new bio",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    mockedToPublicUser.mockReturnValue({
      id: "user-1",
      email: "jane@example.com",
      fullName: "Jane Updated",
      bio: "new bio",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const request = new NextRequest("http://localhost/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: "session_id=session-1",
      },
      body: JSON.stringify({
        fullName: "Jane Updated",
        bio: "new bio",
      }),
    });
    const response = await PATCH(request);

    expect(response.status).toBe(200);
    expect(mockedUpdateUserProfile).toHaveBeenCalledWith("user-1", {
      fullName: "Jane Updated",
      bio: "new bio",
    });
  });
});
