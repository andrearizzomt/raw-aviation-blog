# Deploying RAW Aviation Blog on Railway — Production Guide

This guide covers promoting the RAW Aviation Blog from a working **staging** environment to a live **production** environment on Railway.

**Prerequisites:** Complete the staging guide first — [RAILWAY_DEPLOYMENT_PATH.md](../RAILWAY_DEPLOYMENT_PATH.md). Production setup is nearly identical to staging, but with stricter security, separate data, and a few extra steps.

**Related docs:**
- Staging guide (step-by-step, beginner): [RAILWAY_DEPLOYMENT_PATH.md](../RAILWAY_DEPLOYMENT_PATH.md)
- Technical reference (env tables, topology): [RAILWAY.md](./RAILWAY.md)
- General checklist (CORS, security, go-live): [DEPLOYMENT.md](../DEPLOYMENT.md)

---

## Why production is a separate environment

Production has:
- **Its own database** — production data must never mix with staging test data
- **Its own secrets** — if a staging secret leaks it cannot be used to attack production
- **Its own domain** — a real custom domain (e.g. `rawaviation.com`), not `*.up.railway.app`
- **Stricter CORS** — only the real production domain can call the production Strapi
- **Backups enabled** — production data loss is unacceptable
- **Debug routes removed** — the `/test` page must not be publicly accessible

---

## Option A vs Option B — how to structure this on Railway

### Option A — Two separate Railway projects (recommended to start)

Create a completely independent second project called `raw-aviation-production`.

**Pros:** Crystal clear separation. Separate dashboard, separate variables, no risk of accidentally wiring staging Next to production Strapi. Easy to reason about.

**Cons:** You manage two project dashboards.

**This guide uses Option A.**

### Option B — Railway Environments inside one project

Railway supports multiple "environments" (staging, production) inside one project, with per-environment variable overrides.

**Pros:** One project view; easier to compare services.

**Cons:** Slightly higher risk of misconfiguration (wrong environment selected). Better once you are comfortable with Railway.

You can migrate to Option B later. Start with Option A.

---

## Step 1 — Create the production Railway project

1. In the Railway dashboard, click **New Project** → **Deploy from GitHub** → select `raw-aviation-blog`.
2. Rename the project **`raw-aviation-production`**.
3. Delete or ignore any auto-created service — you will add them manually below.

---

## Step 2 — Add PostgreSQL (production database)

Same as staging — but this is a **different Postgres instance** with its own data.

1. **+ New** → **Database** → **PostgreSQL**.
2. Note the service name (e.g. `Postgres`) — you will reference it from Strapi.

> **Do not** point production Strapi at the staging database (or vice versa). The variable reference `${{Postgres.DATABASE_URL}}` automatically resolves to the Postgres service inside the same project, so as long as your projects are separate you are safe.

---

## Step 3 — Generate NEW production secrets

**Never reuse staging secrets for production.** Run `openssl rand -base64 32` fresh for each value.

```bash
openssl rand -base64 32   # run once per secret below
```

Generate and store **separately from staging**:
- `APP_KEYS` — two outputs joined by a comma
- `ADMIN_JWT_SECRET`
- `API_TOKEN_SALT`
- `TRANSFER_TOKEN_SALT`
- `ENCRYPTION_KEY`

Store these in a password manager (e.g. 1Password, Bitwarden). Do not put them in a file in this repository.

---

## Step 4 — Add the Strapi service (production)

1. **+ New** → **GitHub Repo** → `raw-aviation-blog`. Rename it **`strapi`**.
2. **Settings → Build:**
   - **Root Directory**: `cms`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
3. **Variables** — same structure as staging but with new secret values:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_CLIENT` | `postgres` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `DATABASE_SSL` | `false` |
   | `APP_KEYS` | your new production comma-separated keys |
   | `ADMIN_JWT_SECRET` | new production value |
   | `API_TOKEN_SALT` | new production value |
   | `TRANSFER_TOKEN_SALT` | new production value |
   | `ENCRYPTION_KEY` | new production value |
   | `PUBLIC_URL` | your production Strapi public URL (e.g. `https://strapi.rawaviation.com`) — set this after assigning a custom domain in Step 7 |

4. Deploy and confirm Strapi starts cleanly (check logs).
5. Open the Strapi admin URL and register your production admin account. Use a **strong, unique password** — different from staging.

---

## Step 5 — Add a Volume for uploads (production)

Same as staging (Step 7 of the staging guide), but attached to the production Strapi service.

1. Strapi service → **Settings** → **Volumes** → **+ New Volume**.
2. Mount path: `/app/public/uploads`.

> For production consider switching to **S3-compatible object storage** (Cloudflare R2, AWS S3) instead of or in addition to a Railway Volume. Object storage survives infrastructure changes, is cheap, and integrates with CDNs for faster image delivery. See `DEPLOYMENT.md` for the migration path.

---

## Step 6 — Add the Next.js service (production)

1. **+ New** → **GitHub Repo** → `raw-aviation-blog`. Rename it **`nextjs`**.
2. **Settings → Build:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
3. **Variables:**

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_STRAPI_API_URL` | production Strapi public URL (assigned in Step 7) |

   > **Important:** Set `NEXT_PUBLIC_STRAPI_API_URL` to the production Strapi URL **before** you trigger the first build. If you need to update this URL after assigning a custom domain, you must trigger a redeploy of Next.js for the change to take effect.

---

## Step 7 — Assign custom domains

Railway allows you to use your own domain (e.g. `rawaviation.com`, `strapi.rawaviation.com`) instead of the auto-generated `*.up.railway.app` URLs.

### For the Next.js service (your public website)

1. Go to the Next.js service → **Settings** → **Domains** → **+ Custom Domain**.
2. Enter your domain (e.g. `rawaviation.com` or `www.rawaviation.com`).
3. Railway shows you DNS records to add (usually a CNAME pointing to Railway's edge).
4. Go to your domain registrar (e.g. Cloudflare, Namecheap) and add those DNS records.
5. Wait for propagation (usually a few minutes on Cloudflare, up to 24h on others).
6. Railway automatically provisions an SSL/HTTPS certificate once DNS resolves.

### For the Strapi service (your CMS backend)

1. Same process — add a subdomain like `strapi.rawaviation.com` or `cms.rawaviation.com`.
2. Once DNS is live and HTTPS works:
   - Set `PUBLIC_URL` on the Strapi service to `https://strapi.rawaviation.com` (no trailing slash)
   - Update `NEXT_PUBLIC_STRAPI_API_URL` on the Next.js service to match
   - Trigger a **redeploy of Next.js** (it must rebuild with the new URL embedded)

> **Why a subdomain for Strapi?** It keeps the CMS admin on a predictable URL, lets you lock it down independently (e.g. IP allowlist), and separates it from the public site.

---

## Step 8 — Lock down CORS for production

Unlike staging (where `*.up.railway.app` is broad), production CORS should **only** allow your real domain.

In `cms/config/middlewares.ts`, update the `origin` array:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'http://localhost:3000',            // local dev only
      'https://rawaviation.com',          // your production domain
      'https://www.rawaviation.com',      // www variant if used
      'https://your-nextjs.up.railway.app', // Railway fallback (optional, remove after domain works)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    keepHeaderOnError: true,
  },
},
```

Commit and push. Railway will redeploy Strapi.

---

## Step 9 — Remove the debug route

Before production traffic arrives, remove or protect the `/test` page.

1. Delete `frontend/src/app/test/page.tsx` (or rename it to be protected by auth).
2. Also remove any `console.log` calls in `frontend/src/lib/api/` that might leak API structure in browser DevTools. See `CLAUDE.md` for the files that have them.
3. Commit and push.

---

## Step 10 — Enable Postgres backups

Production data must be backed up.

1. In the Railway dashboard, go to your **production Postgres service**.
2. Look for **Backups** in the service settings (Railway Pro plan includes daily backups; Hobby plan has limited options).
3. If Railway's built-in backups are insufficient, set up a scheduled `pg_dump` using a Railway cron job service or an external backup tool.

**What to back up:**
- **PostgreSQL** — all your Strapi content (articles, reports, galleries, authors)
- **Uploads volume** — if using a Railway Volume, periodically copy files off to cold storage

> It is worth doing a **restore drill** at least once: back up, then restore to a test database to confirm the backup is valid.

---

## Step 11 — Set Strapi public API permissions

Same as staging: in the Strapi admin → **Settings → Users & Permissions → Roles → Public**, enable `find` and `findOne` for Article, Report, Gallery, and Author-profile.

---

## Step 12 — Smoke test production

Before announcing the site:

- [ ] Visit `https://rawaviation.com` — homepage loads with real content
- [ ] Click into an article, report, and gallery — detail pages work
- [ ] Images load over HTTPS (no mixed-content warnings in the browser)
- [ ] Strapi admin at `https://strapi.rawaviation.com/admin` — login works
- [ ] Contact form submits without error (if implemented)
- [ ] No browser console errors visible to visitors

---

## Keeping staging and production in sync

**Code changes** flow: local → push to git → staging tests → merge to `main` → production redeploys.

**Content** does not sync automatically. Strapi content lives in each environment's Postgres database. If you want to copy content from staging to production (or vice versa), use the **Strapi Transfer** feature (Admin → Settings → Transfer) with the `TRANSFER_TOKEN_SALT` you set.

**Schema changes** (new content types, new fields): deploy code changes to staging first, verify, then deploy to production. Strapi runs migrations on startup.

---

## Quick comparison — staging vs production

| | Staging | Production |
|---|---------|------------|
| Railway project | `raw-aviation-staging` | `raw-aviation-production` |
| Postgres | Separate instance | Separate instance |
| Strapi secrets | Staging-only values | Production-only values (regenerated) |
| Next.js URL | `*.up.railway.app` | `rawaviation.com` (custom domain) |
| Strapi URL | `*.up.railway.app` | `strapi.rawaviation.com` (custom domain) |
| CORS | Broad (`*.up.railway.app`) | Tight (production domain only) |
| Uploads | Railway Volume | Railway Volume or S3/R2 |
| Backups | Optional | **Required** |
| Debug `/test` route | OK for testing | **Remove before launch** |
| Admin password | Testing password | Strong, unique password |
