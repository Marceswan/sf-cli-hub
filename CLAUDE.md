# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

SFDX Hub — a community-driven web registry for Salesforce developer tools (CLI plugins, LWC, Apex utilities). Full-stack Next.js app with auth, submissions, ratings/reviews, and admin moderation. Live at sfdxhub.com.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) at localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push schema changes to Neon Postgres |
| `npm run db:studio` | Drizzle Studio (DB GUI) |
| `npm run db:generate` | Generate migration files |

No test framework is configured.

## Architecture

**Stack**: Next.js 16 (App Router) / React 19 / Tailwind CSS 4 / Drizzle ORM / Neon Postgres / Auth.js v5 / Zod 4 / Vercel

**Path alias**: `@/*` maps to `./src/*`

### Styling — Tailwind v4 CSS-first (no tailwind.config.ts)

All design tokens are defined via `@theme` blocks in `src/app/globals.css`. Dark mode uses CSS variable overrides in `.dark` class. Custom utility classes: `.gradient-text`, `.hero-glow`, `.glass`, `.code-block`, `.grid-line-pattern`, `.grid-square-pattern`.

Use `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional class merging.

### Database — Drizzle ORM + Neon

- Schema: `src/lib/db/schema.ts` — 9 tables (users, accounts, sessions, verification_tokens, resources, tags, resource_tags, reviews, resource_screenshots, site_settings)
- Client: `src/lib/db/index.ts` — exports `db` singleton using `@neondatabase/serverless`
- Config: `drizzle.config.ts` — migrations output to `src/lib/db/migrations`
- Enums: `user_role` (user/admin), `resource_category` (cli-plugins, lwc-library, apex-utilities, agentforce, flow, experience-cloud), `resource_status` (pending/approved/rejected)
- Ratings are denormalized on `resources` table (`avg_rating`, `reviews_count`)

### Auth — Auth.js v5 with JWT strategy

- Config: `src/lib/auth.ts` — GitHub OAuth + email/password credentials
- Helpers: `src/lib/auth-utils.ts` — `getCurrentUser()`, `requireAuth()`, `requireAdmin()`
- Middleware: `src/middleware.ts` — protects `/submit`, `/profile`, `/resources/*/edit` (require login) and `/admin/*` (require admin role)
- Type augmentation: `src/types/index.ts` — extends NextAuth Session/JWT with `role` and `id`
- Auth.js tables (users, accounts, sessions, verification_tokens) use Drizzle adapter with the shared schema

### API Routes

All under `src/app/api/`. REST-style: GET for listing/detail, POST for creation, PATCH for updates, DELETE for removal. Auth checks done inline via `getCurrentUser()` / role checks. Validation via Zod schemas from `src/lib/validators.ts`.

### Key Patterns

- **Server Components by default** — client components use `"use client"` directive
- **Providers wrap at root layout**: `SessionProvider` > `ThemeProvider` > `Header` + `main` + `Footer`
- **Resource slugs** for public URLs, UUIDs for API/DB operations
- **Single-row site_settings table** for admin config (e.g., `requireApproval`, `heroWords`)
- **Cloudinary** for screenshot uploads (`src/lib/cloudinary.ts`)
- **GSAP** for animations (`src/hooks/use-gsap.ts`)
- **One review per user per resource** enforced by unique DB index

### Resource Categories

`cli-plugins` | `lwc-library` | `apex-utilities` | `agentforce` | `flow` | `experience-cloud`

When adding a new category, update: the `resourceCategoryEnum` in schema.ts, the `category` field in `resourceSchema` in validators.ts, and the `ResourceCategory` type in types/index.ts.

## Environment Variables

Required in `.env.local`: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `NEXT_PUBLIC_APP_URL`, `AUTH_TRUST_HOST`

**Note**: `next.config.ts` has hardcoded fallback values for all env vars. These are the production credentials and should be rotated if exposed.
