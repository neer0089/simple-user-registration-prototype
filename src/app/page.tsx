import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-6">
      <h1 className="text-3xl font-semibold">User Registration Prototype</h1>
      <p className="mt-2 text-gray-600">
        Lightweight Next.js demo with registration, login, and profile updates.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link className="cursor-pointer rounded-md bg-black px-4 py-2 text-center text-white" href="/register">
          Register
        </Link>
        <Link
          className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-center text-black"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-center text-black"
          href="/profile"
        >
          Profile
        </Link>
      </div>
    </main>
  );
}
