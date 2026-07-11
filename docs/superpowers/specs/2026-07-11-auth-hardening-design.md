# Auth hardening: OAuth + route protection

## Context

Better Auth is already wired up for email/password (`src/lib/auth/auth.ts`),
with sessions, and DB tables (`user`, `session`, `account`, `verification`)
already shaped correctly for OAuth — the `account` table has
`accountId`/`providerId`/token columns, so adding providers needs no schema
migration.

Two real gaps exist:
1. No OAuth providers configured — no Google or GitHub sign-in.
2. No route protection for the `(app)` shell. Only `/editor/[memeId]`
   checks the session server-side; `/dashboard`, `/settings`,
   `/collections`, `/favorites`, `/templates`, `/explore`, `/trending`,
   `/search`, `/ai-generator`, `/gif-generator`, and `/editor/new` are all
   reachable by anonymous visitors.

## Decision: protect the whole `(app)` shell

The sidebar (`src/app/(app)/_components/app-sidebar.tsx`) mixes
account-specific nav (Dashboard, Collections, Favorites) with browsing nav
(Explore, Trending, Templates) as one shell. Rather than split protection
per-route, the entire `(app)` route group requires a session. The marketing
site (`(marketing)` group) stays fully public.

## Architecture

`middleware.ts` at the project root uses `getSessionCookie` from
`better-auth/cookies` — a cookie-presence check, no DB round-trip — to gate
every request under `(app)`. Unauthenticated requests redirect to
`/sign-in?redirect=<original-path>`. The existing page-level ownership
check in `/editor/[memeId]` (session + `meme.userId` match) stays as
defense-in-depth; middleware only proves *a* session exists, not that it
owns the resource being requested.

## Components

- `middleware.ts` (new) — matcher config for `(app)` paths, cookie check,
  redirect-with-return-path logic.
- `src/lib/auth/auth.ts` — add a `socialProviders` block. Each provider
  (`google`, `github`) is only included if its client id/secret env vars
  are both set, so the app still boots with zero OAuth configured.
- `src/lib/env.ts` — add optional `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
- `src/features/auth/components/oauth-buttons.tsx` (new) — "Continue with
  Google" / "Continue with GitHub" buttons shared by sign-in and sign-up
  forms, calling `authClient.signIn.social({ provider })`.
- `.env.example` — document the new vars and the exact redirect URI each
  provider needs (`{BETTER_AUTH_URL}/api/auth/callback/google` and
  `.../github`), since the user needs these to register OAuth apps.

## Error handling

No credentials configured is an expected state (this is a fresh project).
Clicking an OAuth button in that state surfaces Better Auth's own error via
a toast rather than crashing. The buttons render unconditionally; there's
no server->client flag indicating "is this provider configured" (not worth
the plumbing for two providers), so failure is discovered at click-time in
dev, which is fine here since the user does not have credentials yet.

## Testing / verification

No meaningful unit-test surface (config wiring + a redirect). Verified by
running the dev server and driving it in-browser: confirm `/dashboard`
redirects to `/sign-in?redirect=/dashboard` when logged out, confirm
sign-in returns to that path, confirm OAuth buttons render and fail
gracefully without credentials configured.

## Commit plan

1. `feat(auth): protect app shell with session middleware`
2. `feat(auth): add Google/GitHub OAuth providers`
