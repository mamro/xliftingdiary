# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Project

xliftingdiary is a Next.js (App Router) project, currently at the freshly-scaffolded `create-next-app` stage — no custom routes, components, or data layer exist yet beyond `src/app/page.tsx` and `src/app/layout.tsx`.

Stack: Next.js 16.3.4, React 19.2.8, TypeScript (strict), Tailwind CSS v4 (via `@tailwindcss/postcss`), ESLint 9 flat config (`eslint-config-next`).

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture notes

- App Router under `src/app/`. Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Styling is Tailwind v4, configured through PostCSS (`postcss.config.mjs`), with global styles in `src/app/globals.css`.
- `next.config.ts` is currently empty — no custom Next.js config yet.

## Important: this is not the Next.js you know

this Next.js version may have breaking API/convention changes relative to training data. Before writing Next.js code (routing, data fetching, config, etc.), check the relevant guide under `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) rather than relying on prior knowledge, and follow any deprecation notices found there.
