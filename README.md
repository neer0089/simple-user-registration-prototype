# Simple User Registration Prototype

Small Next.js prototype that demonstrates:
- user registration
- login with cookie-based session auth
- profile view and profile update

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- SQLite (Node built-in `node:sqlite`) with a tiny repository layer
- Jest + Testing Library

## Setup and Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

SQLite database file is created automatically at `data/dev.sqlite` (or custom `DB_PATH` from env).

## Test and Lint

```bash
npm run lint
npm test
```

## Demo Walkthrough (2-3 minutes)

1. Open home page and click **Register**.
2. Register with a full name, email, and password.
3. Go to **Login** and sign in with the same credentials.
4. Confirm redirect to **Profile** page (session-protected).
5. Update full name/bio and click **Save profile**.
6. Refresh the page to show profile data persists in SQLite.
7. Click **Logout**.
8. Navigate to `/profile` again and confirm redirect to `/login`.

## Thought Process

The goal was to keep the prototype practical and lightweight while still showing a full end-to-end flow.  
I used a single Next.js app with route handlers to keep frontend/backend boundaries clear without adding service orchestration overhead.  
For persistence, SQLite via Node built-in `node:sqlite` keeps setup minimal (no Docker) and still provides durable data for demoing updates across refreshes.  
Cookie-based sessions are implemented with an HTTP-only cookie and a server-side `sessions` table, which is simple, understandable, and enough for prototype authentication behavior.
