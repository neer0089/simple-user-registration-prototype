"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PublicUser } from "@/repositories/user.repository";

interface ProfileResponse {
  user?: PublicUser;
  error?: string;
}

interface ProfileClientProps {
  initialUser: PublicUser;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser>(initialUser);
  const [fullName, setFullName] = useState(initialUser.fullName);
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          bio: bio.trim() === "" ? null : bio,
        }),
      });
      const data = (await response.json()) as ProfileResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !data.user) {
        setMessage(data.error ?? "Could not update profile.");
        return;
      }

      setUser(data.user);
      setFullName(data.user.fullName);
      setBio(data.user.bio ?? "");
      setMessage("Profile updated.");
    } catch {
      setMessage("Unexpected error while updating profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <button className="cursor-pointer text-sm underline" onClick={logout} type="button">
          Logout
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600">Signed in as {user.email}</p>

      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Full name</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            className="min-h-24 rounded-md border border-gray-300 px-3 py-2"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={280}
          />
        </label>

        <button
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={saveProfile}
          type="button"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </div>

      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </main>
  );
}
