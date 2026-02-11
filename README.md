# SFDX Hub

A community-driven web registry for Salesforce developer tools — CLI plugins, Lightning Web Components, and Apex utilities. Built as a full-stack Next.js application with user authentication, submissions, ratings, reviews, and admin moderation.

**Live**: [sf-cli-hub.vercel.app](https://sf-cli-hub.vercel.app)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4 (CSS-first config) |
| Database | Neon Postgres via Drizzle ORM |
| Auth | Auth.js v5 (GitHub OAuth + Credentials) |
| Validation | Zod 4 |
| Icons | Lucide React |
| Hosting | Vercel |

## Features

- **Browse & Search** — Filter by category (CLI Plugins, LWC Library, Apex Utilities), full-text search, sorting, pagination
- **Resource Detail Pages** — Install commands with copy-to-clipboard, version info, external links, reviews
- **User Authentication** — GitHub OAuth and email/password registration
- **Submissions** — Authenticated users can submit tools for community review
- **Ratings & Reviews** — Star ratings, written reviews, one review per user per resource, denormalized aggregation
- **Admin Panel** — Dashboard with stats, submission moderation queue (approve/reject), resource management
- **Dark/Light Mode** — System-aware with manual toggle, smooth transitions
- **Responsive** — Mobile-first with collapsible navigation

## Project Structure

```
src/
  app/
    (auth)/          # Login and register pages
    admin/           # Admin dashboard, submissions queue, resource manager
    api/             # REST API routes (resources, reviews, auth, admin stats)
    browse/          # Filterable resource browser
    resources/[slug] # Resource detail pages
    submit/          # Submission form (protected)
    profile/         # User profile (protected)
  components/
    ui/              # Button, Badge, Card, Input, Tabs, StarRating, Skeleton
    layout/          # Header, Footer, ThemeToggle
    home/            # HeroSection, TerminalAnimation, CategorySection
    browse/          # SearchBar, CategoryTabs, SortDropdown
    resource/        # ResourceCard, InstallCommand, ReviewForm, ReviewList
    admin/           # StatsCards, SubmissionActions, ResourceActions
    providers/       # ThemeProvider, SessionProvider
  lib/
    db/              # Drizzle client + schema (8 tables)
    auth.ts          # Auth.js config
    auth-utils.ts    # getCurrentUser, requireAuth, requireAdmin
    validators.ts    # Zod schemas
    utils.ts         # cn(), slugify(), formatDate()
```

## Database Schema

| Table | Purpose |
|---|---|
| `users` | User accounts (extends Auth.js schema with role, bio, github_url) |
| `accounts` | OAuth provider accounts (Auth.js) |
| `sessions` | Active sessions (Auth.js) |
| `verification_tokens` | Email verification (Auth.js) |
| `resources` | Registry items — name, slug, category, install command, ratings |
| `tags` | Flexible tag labels |
| `resource_tags` | Many-to-many junction |
| `reviews` | Ratings (1-5) + written reviews, unique per user per resource |

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/resources` | No | List/search with category, query, sort, pagination |
| POST | `/api/resources` | Yes | Submit new resource (status: pending) |
| GET | `/api/resources/[id]` | No | Resource detail + reviews |
| PATCH | `/api/resources/[id]` | Owner/Admin | Update resource or change status |
| DELETE | `/api/resources/[id]` | Admin | Delete resource |
| POST | `/api/reviews` | Yes | Create review (one per user per resource) |
| PATCH | `/api/reviews/[id]` | Owner | Update own review |
| DELETE | `/api/reviews/[id]` | Owner/Admin | Delete review |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |

## Getting Started

### Prerequisites

- Node.js 22+
- A [Neon](https://neon.tech) Postgres database
- A [GitHub OAuth App](https://github.com/settings/developers) (optional, for GitHub login)

### Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/Marceswan/sf-cli-hub.git
   cd sf-cli-hub
   npm install
   ```

2. **Configure environment** — copy `.env.local.example` or create `.env.local`:
   ```env
   DATABASE_URL=postgresql://...@...neon.tech/sfdx_hub?sslmode=require
   AUTH_SECRET=<run: openssl rand -base64 33>
   AUTH_GITHUB_ID=<from GitHub OAuth App>
   AUTH_GITHUB_SECRET=<from GitHub OAuth App>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   AUTH_TRUST_HOST=true
   ```

3. **Push database schema**:
   ```bash
   npm run db:push
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to Neon |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:generate` | Generate migration files |

## Deployment

The app deploys to Vercel via GitHub integration. Set the following environment variables in the Vercel dashboard:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXT_PUBLIC_APP_URL` (your Vercel domain)
- `AUTH_TRUST_HOST=true`

## Design

The UI is inspired by [Tailwind Plus](https://tailwindcss.com/plus) with a dark-mode-first aesthetic. Design tokens are configured via Tailwind CSS v4's CSS-first `@theme` blocks in `globals.css` — no `tailwind.config.ts` file.

Key design elements:
- Glassmorphism header with backdrop blur
- Gradient text accents (Salesforce Blue → Indigo → Pink)
- Radial glow hero effect
- Terminal animation on homepage
- Consistent card-based layouts with hover glow effects

## License

ISC
