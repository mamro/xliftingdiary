# Auth Coding Standards

This document defines the only acceptable way to handle authentication in this app. Follow it exactly — these are not suggestions.

## Clerk is the only auth provider

This app uses [Clerk](https://clerk.com) for **all** authentication and session management.

- **Do not** hand-roll auth (custom sign-in forms, JWT handling, password hashing, session cookies, etc.).
- **Do not** introduce another auth provider or library (NextAuth/Auth.js, Lucia, Supabase Auth, Firebase Auth, etc.) alongside or instead of Clerk.
- Sign-in and sign-up pages live at `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx`, rendering Clerk's `<SignIn />` / `<SignUp />` components via Clerk's catch-all route convention. Do not build custom sign-in/sign-up forms.

## Middleware

`src/proxy.ts` runs `clerkMiddleware()` from `@clerk/nextjs/server` with the project's route matcher. This is what makes auth state available across the app (including Server Components). Do not remove or bypass this middleware, and do not add a second, competing middleware file.

If a route ever needs to be protected or redirected based on auth state, do it by extending the `clerkMiddleware()` callback in `src/proxy.ts` — not with ad-hoc checks scattered in pages.

## Provider and UI

`src/app/layout.tsx` wraps the app in `<ClerkProvider>` from `@clerk/nextjs`. This must remain at the root layout so every route has access to Clerk's context.

For auth-conditional UI (e.g. showing a sign-in button vs. a user menu), use Clerk's own components:

- `<Show when="signed-out">` / `<Show when="signed-in">` to conditionally render children based on auth state.
- `<SignInButton />` / `<SignUpButton />` for triggering sign-in/sign-up (e.g. `mode="modal"`).
- `<UserButton />` for the signed-in user's account menu.

Do not write custom `if (userId)` branching in components to show/hide auth UI when a Clerk component already does the job — this keeps in line with the [UI standards](./ui.md) requirement to use vendored, pre-built components rather than hand-rolled ones.

## Reading the authenticated user

Server-side, get the current user with `auth()` from `@clerk/nextjs/server`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- `auth()` is only called from Server Components or helpers in `/data` (see [data-fetching.md](./data-fetching.md) — all data fetching happens in Server Components, and every `/data` query helper must be scoped by the authenticated user's ID).
- `userId` from `auth()` is the **only** acceptable source of the current user's identity for scoping a database query. Never trust a client-supplied user ID (route param, form field, request body) for this purpose.
- If `userId` is `null`, the helper must return an empty/safe result (e.g. `return []`) rather than querying unscoped. See `src/data/workouts.ts` for the established pattern:

```ts
export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workoutsTable.findMany({
    where: { userId, date },
    // ...
  });
}
```

- Do not fetch the current user in a Client Component (no client-side Clerk hooks like `useAuth()`/`useUser()` used to gate data access). Auth-conditional **data** fetching stays server-side per `data-fetching.md`; Clerk's client hooks/components are only for auth-conditional **UI** (see above).

## Environment variables

Clerk keys live in `.env` and must never be hardcoded:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

Do not commit real secret values, and do not introduce new ad-hoc env vars for auth configuration when Clerk already exposes the setting (sign-in/sign-up URLs, redirect URLs, etc.) through its own environment variables.
