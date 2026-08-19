"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface RegisterResult {
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  error?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = (await response.json()) as RegisterResult;
      if (!response.ok) {
        setMessage(data.error ?? "Registration failed.");
        return;
      }

      setMessage(`Registered ${data.user?.fullName}. You can login now.`);
      setPassword("");
      router.push("/login");
      router.refresh();
    } catch {
      setMessage("Unexpected error while registering.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Register with your email and basic details to continue.
      </p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Full name</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Jane Doe"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Email</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@example.com"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Password</span>
          <input
            className="rounded-md border border-gray-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />
        </label>

        <button
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm">{message}</p> : null}

      <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
        <p>Already have an account?</p>
        <button
          className="cursor-pointer font-medium text-black underline"
          onClick={() => router.push("/login")}
          type="button"
        >
          Login
        </button>
      </div>
    </main>
  );
}
