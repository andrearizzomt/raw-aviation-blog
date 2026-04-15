# CLAUDE.md - RAW Aviation Blog

## Project Overview

Aviation blog featuring articles, airshow reports, and photo galleries. Content is managed in Strapi CMS and rendered by a Next.js frontend.

**Tech stack:**
- **Frontend**: Next.js 16.0.5 (App Router, React 19, Turbopack), Tailwind CSS v4, TypeScript, Zod validation
- **CMS**: Strapi 5.16.1 (headless CMS), SQLite (dev) / PostgreSQL (prod)
- **Target deployment**: Self-hosted VPS (not Vercel)

## Project Structure

```
raw-aviation-blog/
├── frontend/                 # Next.js app (port 3000)
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx              # Homepage - fetches latest 3 of each content type
│   │   │   ├── articles/             # /articles and /articles/[slug]
│   │   │   ├── reports/              # /reports and /reports/[slug]
│   │   │   ├── galleries/            # /galleries and /galleries/[slug]
│   │   │   ├── about/page.tsx        # Team page - public author profiles
│   │   │   ├── contact/page.tsx      # Contact form (client component)
│   │   │   ├── test/page.tsx         # API debug page
│   │   │   ├── layout.tsx            # Root layout with ThemeProvider, Navigation, ScrollToTop
│   │   │   └── globals.css           # CSS custom properties for light/dark themes
│   │   ├── components/ui/
│   │   │   ├── author-display.tsx    # Reusable author component (horizontal/vertical, sm/md/lg)
│   │   │   ├── navigation.tsx        # Fixed navbar + mobile hamburger menu
│   │   │   ├── theme-toggle.tsx      # Dark/light mode switcher
│   │   │   ├── theme-provider.tsx    # Theme context with localStorage persistence
│   │   │   └── scroll-to-top.tsx     # Scroll restoration on route change
│   │   └── lib/
│   │       ├── api/
│   │       │   ├── strapi.ts         # fetchAPI() wrapper and getStrapiMedia() helper
│   │       │   └── content.ts        # getArticles(), getReports(), getGalleries(), etc.
│   │       ├── schemas/strapi.ts     # Zod validation schemas (runtime type checking)
│   │       └── types/strapi.ts       # TypeScript interfaces
│   ├── .env.local                    # NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
│   └── next.config.ts                # Image remotePatterns for localhost:1337
│
├── cms/                      # Strapi CMS (port 1337)
│   ├── src/api/
│   │   ├── article/          # Title, Slug, Content (blocks), Date, authors, Featured_Image
│   │   ├── report/           # Title, Slug, Content (blocks), Date, authors, MainImage, Images
│   │   ├── gallery/          # Title, slug, Date, Description, authors, Images
│   │   └── author-profile/   # displayName, bio, profilePhoto, position, authorType, orderWeight, socials
│   ├── config/
│   │   ├── database.ts       # SQLite default, supports MySQL/PostgreSQL
│   │   ├── api.ts            # defaultLimit: 25, maxLimit: 100
│   │   └── plugins.ts        # Upload breakpoints: 1000, 750, 500, 250px; 10MB limit
│   ├── seed.mjs              # Seed script: creates sample authors, articles, reports, galleries
│   └── .env                  # Host, port, keys (dev defaults - change for prod)
│
├── CLAUDE.md                 # This file
├── TO_DO_LIST.md             # Detailed progress tracker
├── USER_SYSTEM_ARCHITECTURE.md  # Author system design document
├── DEPLOYMENT.md             # VPS deployment guide
└── STARTUP_GUIDE.md          # Dev setup instructions
```

## Setup & Running

```bash
# CMS (start first - frontend depends on it)
cd cms
npm install
npm run develop          # http://localhost:1337 (admin: /admin)

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:3000

# Seed sample data (CMS must be running)
cd cms
# Set SEED_* in cms/.env (see cms/.env.example), then:
npm run seed             # Creates 3 authors, 5 articles, 3 reports, 3 galleries
```

**Strapi admin**: sign in at http://localhost:1337/admin with the admin user you created at first boot. Seed credentials live only in `cms/.env` (`SEED_ADMIN_*`, `SEED_USER_PASSWORD`), not in the repo.

## Strapi Content Types

| Type | Key fields | Notes |
|------|-----------|-------|
| **Article** | Title, Slug (uid), Content (blocks), Date, authors (m2m), Featured_Image | `populate=*` for author/image data |
| **Report** | Title, Slug (uid), Content (blocks), Date, authors (m2m), MainImage, Images[] | Multiple images support |
| **Gallery** | Title, slug (uid), Date, Description (text), authors (m2m), Images[] | Note: `slug` is lowercase (unlike other types) |
| **Author Profile** | displayName, bio (richtext), profilePhoto, position, authorType (enum), orderWeight, instagram, facebook | `isPublicAuthor` controls About page visibility |

**Author types**: `founder`, `external_contributor`, `guest`
**Author ordering**: `orderWeight` (0-9999, lower = first), then `authorType`, then `displayName`

## Data Flow

```
Page component → lib/api/content.ts → lib/api/strapi.ts (fetchAPI)
  → GET http://localhost:1337/api/{type}?populate=*&sort=Date:desc
  → Zod validation (lib/schemas/strapi.ts)
  → Typed response (lib/types/strapi.ts)
  → Component renders
```

All pages are Server Components (no `"use client"`) except `/contact` and theme components.

## Key Decisions & Patterns

- **Dual type system**: Both Zod schemas (runtime validation) AND TypeScript interfaces exist. The Zod schemas are the source of truth for API responses. The TS interfaces are used for component props. They must be kept in sync manually.
- **Content blocks**: Strapi `blocks` type returns `[{type: "paragraph"|"heading", children: [{type: "text", text: "..."}], level?: number}]`. The article detail page renders ALL block types as `<p>` tags - headings are not differentiated in rendering.
- **Theme**: Inline `<script>` in layout.tsx prevents flash of wrong theme. ThemeProvider uses localStorage. `suppressHydrationWarning` on `<html>`.
- **Image handling**: `getStrapiMedia()` prepends `STRAPI_URL` to relative URLs. Uses Next.js `<Image>` with `fill` and `remotePatterns` config for localhost:1337.
- **Gallery slug casing**: Gallery uses lowercase `slug` while Article/Report use uppercase `Slug`. This is a Strapi schema inconsistency that must be matched in API calls and Zod schemas.
- **No caching/ISR**: All pages fetch fresh data on each request. No `revalidate` or static generation configured.
- **Debug logging**: `console.log` statements exist in `lib/api/content.ts` and `lib/api/strapi.ts` for debugging API calls. These should be removed for production.

## Known Issues / TODOs

- **Content block rendering is basic**: Article/report detail pages render all blocks as `<p>` tags. Headings (`type: "heading"`) should render as `<h2>`/`<h3>` based on `level`. Bold, italic, links within text children are not handled.
- **SVG placeholder images**: Current seed data uses SVG placeholders. SVGs have `formats: null` (no thumbnails). The Zod schemas were patched to handle this (`.nullable()` on `formats`), but real images (PNG/JPEG) will have format objects.
- **TypeScript types don't match Zod**: The `FeaturedImage.formats` TS interface doesn't have `.nullable()` matching the Zod schema. This could cause issues if code checks `formats` without null guard.
- **No contact message content type**: The contact form posts to `/api/contact-messages` but no such Strapi content type exists in the schema files.
- **`populate=*` is shallow**: Nested relations (e.g., author's profilePhoto within an article's authors) are not populated. The `user` field on author profiles returns `null` via `populate=*`.
- **No error boundaries**: Pages use try/catch but no React error boundaries.
- **Test page exists**: `/test` page is a debug utility that should be removed before production.

## Dev Notes

- **Starting order matters**: Strapi must be running before the frontend starts, or homepage will error (fetches on load).
- **Seed script auth**: `cms/seed.mjs` reads `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_USER_PASSWORD` from `cms/.env` (gitignored). It logs in via the admin API, registers sample users, creates content via `/content-manager/collection-types/...`, and uploads via `/upload`.
- **Strapi 5 API paths**: Content-manager endpoints are at `/content-manager/...` (NOT `/admin/content-manager/...`). Upload is at `/upload` (NOT `/api/upload`). Public API is at `/api/...`.
- **SQLite dev DB**: Located at `cms/.tmp/data.db`. Gitignored. Wiping it resets all content but requires re-registering an admin user at first Strapi startup.
- **Node version**: CMS requires Node 18-22 (`engines` in package.json).
- **Tailwind v4**: Uses `@tailwindcss/postcss` plugin, not the older `tailwindcss` PostCSS plugin. Config is via CSS (`globals.css` with `@theme` and custom properties), not `tailwind.config.js`.
