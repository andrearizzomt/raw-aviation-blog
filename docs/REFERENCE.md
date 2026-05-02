# Technical Reference — RAW Aviation Blog

Env var tables, service topology, code patterns, author schema, and security checklist. This is the "look it up" doc — not a step-by-step guide.

**Deployment guides:** [STAGING.md](./STAGING.md) · [PRODUCTION.md](./PRODUCTION.md)

---

## Railway service topology

Each environment (staging, production) runs three services:

```
┌─────────────────────────────────────────────────────┐
│  raw-aviation-staging  OR  raw-aviation-production  │
├─────────────────────────────────────────────────────┤
│  [PostgreSQL]  ←── private network ──→  [Strapi]    │
│                                              ↑       │
│                              NEXT_PUBLIC_STRAPI_URL  │
│                                              │       │
│                                         [Next.js]   │
└─────────────────────────────────────────────────────┘
```

| Service | Repo folder | Build | Start | Port |
|---------|-------------|-------|-------|------|
| PostgreSQL | Railway template | n/a | n/a | internal |
| Strapi | `cms/` | `npm ci && npm run build` | `npm run start` | Railway injects `PORT` |
| Next.js | `frontend/` | `npm ci && npm run build` | `npm run start` | Railway injects `PORT` |

**Notes:**
- Railway injects `PORT` into each service. Strapi reads it via `env.int('PORT', 1337)` in `cms/config/server.ts`.
- `DATABASE_URL` is referenced from the Postgres service using `${{Postgres.DATABASE_URL}}` — Railway fills it in at runtime so you never paste raw credentials.

---

## Environment variables

### Strapi (`cms` service)

| Variable | Required | Value / Notes |
|----------|----------|---------------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_CLIENT` | Yes | `postgres` |
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` — reference to Railway Postgres service |
| `DATABASE_SSL` | Yes | `false` for Railway private network; `true` if using external DB |
| `APP_KEYS` | Yes | Two `openssl rand -base64 32` values joined by a comma |
| `ADMIN_JWT_SECRET` | Yes | One `openssl rand -base64 32` value |
| `API_TOKEN_SALT` | Yes | One `openssl rand -base64 32` value |
| `TRANSFER_TOKEN_SALT` | Yes | One `openssl rand -base64 32` value |
| `ENCRYPTION_KEY` | Yes | One `openssl rand -base64 32` value |
| `JWT_SECRET` | Yes | One `openssl rand -base64 32` value — required by users-permissions plugin |
| `PUBLIC_URL` | Production only | Your public Strapi HTTPS URL (e.g. `https://strapi.rawaviation.com`) — needed for correct admin links |
| `HOST` | No | Defaults to `0.0.0.0` — correct for containers |
| `PORT` | Auto | Injected by Railway — do not hardcode |

Generate secrets:
```bash
openssl rand -base64 32   # run once per secret
```

### Next.js (`frontend` service)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` |
| `NEXT_PUBLIC_STRAPI_API_URL` | Yes | Public Strapi base URL, **no trailing slash** (e.g. `https://strapi-staging-a15c.up.railway.app`). Must be set before `next build` — it's baked into the JS bundle at build time. |
| `PORT` | Auto | Injected by Railway |

### Local development (not on Railway)

| File | Variable | Value |
|------|----------|-------|
| `frontend/.env.local` | `NEXT_PUBLIC_STRAPI_API_URL` | `http://localhost:1337` |
| `cms/.env` | All Strapi vars | Dev placeholder values — never commit real secrets |

---

## Data persistence

### PostgreSQL

- Railway Postgres persists data for the life of the database service
- Redeploying Strapi does **not** wipe Postgres
- Strapi runs schema migrations automatically on startup
- **Backups:** enable in Railway dashboard for production; consider scheduled `pg_dump` for extra safety

### Uploads (Strapi media files)

Strapi stores uploaded files in `cms/public/uploads/`. Container filesystems are ephemeral — files are lost on redeploy unless you attach storage.

| Option | Survives redeploy? | Notes |
|--------|-------------------|-------|
| No storage (default) | No | Only for quick testing |
| Railway Volume at `/app/public/uploads` | Yes | Good for staging; simple setup |
| S3-compatible (Cloudflare R2, AWS S3) | Yes | Best for production; CDN-friendly; requires `@strapi/provider-upload-aws-s3` plugin |

---

## Security checklist

- [ ] HTTPS everywhere — Railway provides this automatically for public URLs
- [ ] CORS restricted to real frontend origins (see `cms/config/middlewares.ts`)
- [ ] Strapi secrets are unique per environment — never reuse staging secrets in production
- [ ] All secrets stored in Railway Variables, not in committed files
- [ ] Strong admin password for Strapi (different for staging vs production)
- [ ] Public Strapi roles reviewed — only `find`/`findOne` enabled, not `create`/`update`/`delete`
- [ ] Debug route `frontend/src/app/test/page.tsx` removed before production
- [ ] `console.log` calls removed from `frontend/src/lib/api/` before production
- [ ] Postgres backups enabled for production
- [ ] `.env`, `.env.local`, `cms/.tmp/` remain gitignored

---

## Go-live checklist

### Blockers (must do before public URL)

- [ ] Uploads persistence — Railway Volume or S3/R2
- [ ] Production secrets rotated (never reuse staging values)
- [ ] Contact form backend — Strapi `Contact Message` content type + public `create` permission
- [ ] Remove `/test` debug route
- [ ] CORS locked to production domain only

### Strongly recommended

- [ ] `generateMetadata` on `/articles/[slug]`, `/reports/[slug]`, `/galleries/[slug]`
- [ ] `sitemap.ts` / `robots.ts` in the Next.js app
- [ ] `not-found.tsx` / `error.tsx` for failed API calls or missing slugs
- [ ] Rich block rendering (headings, lists, links) — currently all blocks render as `<p>` tags

### After launch

- [ ] Caching / `revalidate` so page requests don't hammer Strapi on every load
- [ ] Analytics / error monitoring
- [ ] Backup restore drill

---

## Author Profile system

### Content type fields

| Field | Type | Notes |
|-------|------|-------|
| `displayName` | string | Required |
| `bio` | rich text or string | Optional |
| `profilePhoto` | media | Optional |
| `position` | string | Required (e.g. "Founder", "Photographer") |
| `isPublicAuthor` | boolean | Controls visibility on the About page |
| `authorType` | enum | `founder` / `external_contributor` / `guest` |
| `authorSlug` | uid | Auto-generated from `displayName` |
| `showContributionCount` | boolean | Whether to show article/report/gallery counts |
| `instagram` | string | Optional URL |
| `facebook` | string | Optional URL |
| `orderWeight` | integer (0–9999) | Lower = appears first. Default 1000 allows easy insertion |
| `user` | relation → User | Optional link to a Strapi login account |

### Author types

| Type | Used for | About page section |
|------|----------|--------------------|
| `founder` | Core team members | "Who We Are" |
| `external_contributor` | Regular external writers/photographers | "Contributors & Guests" |
| `guest` | One-time contributors | "Contributors & Guests" |

### Content type relations

All three content types support multiple authors (many-to-many):

```
Author Profile ←→ Article   (many-to-many)
Author Profile ←→ Report    (many-to-many)
Author Profile ←→ Gallery   (many-to-many)
Author Profile  →  User     (optional, many-to-one)
```

### About page logic

The `/about` page queries Author Profiles filtered by `isPublicAuthor: true`, sorted by `orderWeight` then `authorType` then `displayName`:

```
/about
├── "Who We Are" — authorType: founder, isPublicAuthor: true
└── "Contributors & Guests" — authorType: external_contributor or guest, isPublicAuthor: true
```

### API permissions required

For the About page and content attribution to work, enable in Strapi admin → **Settings → Users & Permissions → Roles → Public**:

- `author-profile`: `find`, `findOne`
- `article`: `find`, `findOne`
- `report`: `find`, `findOne`
- `gallery`: `find`, `findOne`

---

## Key code patterns

### Database config (`cms/config/database.ts`)

Reads `DATABASE_CLIENT` env var — defaults to `sqlite` locally, set to `postgres` in production. Supports `DATABASE_URL` (connection string) for Railway.

### TypeScript types (`frontend/src/lib/types/strapi.ts`)

Types are **derived from Zod schemas** using `z.infer<>`. Do not edit the types file directly — update `frontend/src/lib/schemas/strapi.ts` instead. The types automatically update.

### Image handling (`frontend/src/lib/api/strapi.ts`)

`getStrapiMedia()` prepends the Strapi base URL to relative image paths. `next.config.ts` derives `remotePatterns` from `NEXT_PUBLIC_STRAPI_API_URL` so the Next.js Image component accepts Strapi-hosted images.

### Known issues

- **Block rendering is basic** — article/report detail pages render all content blocks as `<p>` tags. Headings (`type: "heading"`) and inline formatting (bold, italic, links) are not handled yet.
- **No caching** — all pages fetch fresh data on every request. No `revalidate` or static generation configured.
- **`populate=*` is shallow** — nested relations beyond one level are not populated.
- **Contact form has no backend** — the form at `/contact` submits to `/api/contact-messages` but no Strapi content type exists for this yet.
