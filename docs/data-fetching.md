# Data Fetching

This document defines the only acceptable way to fetch data in this app. Follow it exactly — these are not suggestions.

## All data fetching happens in Server Components

**ALL** data fetching within this app **MUST** be done via Server Components.

Data **MUST NOT** be fetched via:

- Route Handlers (`route.ts`)
- Client Components (`"use client"`, `useEffect`, SWR, React Query, etc.)
- Any other mechanism

Server Components are the only place a page or layout is allowed to pull data from the database. If a Client Component needs data, it must receive that data as props from a Server Component ancestor — it must never fetch it itself.

This is incredibly important. Do not make exceptions for convenience, "just this once," or because a Route Handler seems simpler for a given case.

## Database queries live in `/data`

Every database query **MUST** be performed through a helper function defined in the `/data` directory. Components — server or otherwise — must never construct or issue a database query inline.

- Helper functions in `/data` **MUST** use Drizzle ORM to query the database.
- Raw SQL is **NOT** allowed, in `/data` or anywhere else, under any circumstance.

## Users may only access their own data

Every helper function in `/data` **MUST** scope its query to the currently authenticated user. A logged-in user **MUST NOT** be able to read, list, or otherwise access any data belonging to another user.

In practice this means:

- Every query against user-owned data includes a `WHERE` clause (via Drizzle's query builder) filtering by the authenticated user's ID.
- The user ID used for scoping comes from the authenticated session, never from a client-supplied parameter (e.g. a route param or request body), so a user cannot simply pass someone else's ID to read their data.
- There are no "admin" or unscoped query helpers that bypass this restriction.

This is incredibly important. Data isolation between users is a hard requirement, not an edge case to handle later.
