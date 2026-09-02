# Data Mutations

This document defines the only acceptable way to mutate data in this app. Follow it exactly — these are not suggestions.

## Database writes live in `/data`

Every database mutation (insert, update, delete) **MUST** be performed through a helper function defined in the `/data` directory. Components, actions, and any other code must never construct or issue a database write inline.

- Helper functions in `/data` **MUST** use Drizzle ORM to perform the write.
- Raw SQL is **NOT** allowed, in `/data` or anywhere else, under any circumstance.
- Mutation helpers must scope writes to the currently authenticated user in the same way read helpers do (see [data-fetching.md](./data-fetching.md)) — a user must never be able to create, update, or delete data on another user's behalf.

## All mutations happen via Server Actions

Data **MUST NOT** be mutated via:

- Route Handlers (`route.ts`)
- Client-side calls to `/data` helpers or the database (Client Components must never import `/data` helpers directly)
- Any other mechanism

Every mutation is triggered through a **Server Action** (`"use server"`), which is the only code allowed to call a mutation helper in `/data`.

## Server Actions live in colocated `actions.ts` files

Server Actions **MUST** be defined in a file named `actions.ts`, colocated with the route/feature that uses them (e.g. `src/app/workouts/[date]/actions.ts`). Do not:

- Define Server Actions inline inside a component file.
- Put unrelated Server Actions for different features into one shared/global `actions.ts`.
- Name the file anything other than `actions.ts`.

Each `actions.ts` file starts with `"use server"` and exports the action functions used by that feature's client code (typically passed to a form's `action` prop or called from an event handler).

## Server Action parameters must be typed, not `FormData`

Every Server Action **MUST** declare explicitly typed parameters (primitives, objects, etc.) — never a `FormData` parameter.

```ts
// Bad — do not do this
"use server";

export async function createWorkout(formData: FormData) {
  const date = formData.get("date");
  // ...
}
```

```ts
// Good
"use server";

export async function createWorkout(input: { date: string }) {
  // ...
}
```

If a form needs to call the action, read field values into a typed object on the client (or via a resolver, e.g. `react-hook-form`) and pass that typed object to the action — do not pass the raw `FormData` object through.

## Every Server Action must validate its arguments with Zod

Every Server Action **MUST** validate the arguments it receives at runtime using [Zod](https://zod.dev), even though the parameters are already typed with TypeScript. TypeScript types are erased at runtime and do not protect a Server Action, which is a public network endpoint that can be invoked with any payload — Zod validation is what actually enforces the shape and constraints of the input.

- Define a Zod schema for the action's input (colocated in the `actions.ts` file, or imported from a shared schema module if reused).
- Parse the incoming arguments with the schema (`schema.parse(...)` or `schema.safeParse(...)`) as the first thing the action does, before calling any `/data` helper.
- If validation fails, the action must return/throw an error rather than proceeding to call a `/data` helper with unvalidated input.

```ts
"use server";

import { z } from "zod";

import { createWorkoutForUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  date: z.string().date(),
});

export async function createWorkout(input: z.infer<typeof createWorkoutSchema>) {
  const { date } = createWorkoutSchema.parse(input);

  return createWorkoutForUser(date);
}
```

This is incredibly important. Do not skip Zod validation because the TypeScript types "already cover it" — they do not, at runtime, for a Server Action.
