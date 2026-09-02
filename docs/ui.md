# UI Coding Standards

This document defines the UI standards for xliftingdiary. It applies to every page, layout, and route in this project, present and future.

## Rule: shadcn/ui only, no custom components

All UI in this project MUST be built exclusively from [shadcn/ui](https://ui.shadcn.com) components.

- **Do not** create custom React components for UI elements (buttons, inputs, cards, date pickers, dialogs, dropdowns, etc.). If a shadcn/ui component exists for the job, use it.
- **Do not** hand-roll markup with raw HTML elements styled directly with Tailwind classes (e.g. a bare `<button className="...">` or `<input className="...">`) when a shadcn/ui equivalent (`Button`, `Input`, etc.) exists.
- **Do not** reach for a third-party component library (Radix directly, Headless UI, Material UI, Chakra, Ant Design, etc.) instead of shadcn/ui.
- If a needed component does not yet exist in the project, add it via the shadcn/ui CLI (`npx shadcn@latest add <component>`) rather than writing it from scratch. This keeps every component consistent with shadcn/ui's structure, styling approach, and accessibility behavior.
- Page- and feature-level files may compose shadcn/ui components together and add layout/spacing via Tailwind utility classes, but the interactive building blocks themselves must always come from shadcn/ui.

## Why

- **Consistency** — every control in the app looks and behaves the same way, because it all comes from the same source.
- **Accessibility** — shadcn/ui components are built on Radix primitives with accessibility handled for us; custom components would need to reinvent that correctly every time.
- **Maintainability** — a single vendored component set is far easier to audit, theme, and upgrade than a patchwork of bespoke components.

## Workflow

1. Check whether the component you need already exists under `src/components/ui/`.
2. If it doesn't, install it with the shadcn/ui CLI: `npx shadcn@latest add <component>`.
3. Import and compose the installed component(s) in your page/feature code.
4. Never edit generated shadcn/ui component internals to work around a one-off need — prefer composition, variants, or props the component already exposes.

## Rule: date formatting via date-fns

All dates displayed in the UI MUST be formatted using [date-fns](https://date-fns.org), using the `do MMM yyyy` format — an ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
```

- **Do not** format dates manually with `Date` string methods, `Intl.DateTimeFormat`, or ad-hoc string concatenation.
- **Do not** introduce another date library (Moment, Luxon, Day.js, etc.) — date-fns is the only date-handling dependency for this project.
- Apply this format consistently everywhere a date is shown to the user (workout dates, timestamps, etc.), unless a specific screen has an explicitly different, agreed-upon format.
