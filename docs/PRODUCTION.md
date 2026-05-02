# Production Deployment — RAW Aviation Blog

How to set up the live production environment on Railway once staging is working.

**Prerequisites:** Staging must be fully verified first — [STAGING.md](./STAGING.md).

**Related docs:** [REFERENCE.md](./REFERENCE.md) · [../TODO.md](../TODO.md)

---

## Why production is a separate environment

Production gets its own everything — separate database, separate secrets, separate domain. The reason:

- **Separate database** — production content must never mix with staging test data
- **Separate secrets** — a leaked staging secret cannot be used to attack production
- **Custom domain** — `rawaviation.com` instead of `*.up.railway.app`
- **Stricter CORS** — only your real domain can call the Strapi API
- **Backups enabled** — data loss in production is unacceptable
- **Debug routes removed** — the `/test` page must not be publicly accessible

---

## Option A vs Option B

### Option A — Two separate Railway projects (recommended to start)

Create a second project called `raw-aviation-production`, independent from staging.

- **Pros:** Clear separation. Separate Postgres, separate variables, no accidental cross-wiring.
- **Cons:** Two dashboards to manage.

### Option B — Railway Environments inside one project

Railway lets you have "staging" and "production" environments inside one project, with separate variables per environment.

- **Pros:** One project dashboard; easier to compare.
- **Cons:** Slightly easier to misconfigure if you select the wrong environment.

**Start with Option A.** You can migrate to Option B later once you're comfortable.

---

## Step 1 — Create the production project

Railway dashboard → **New Project** → **Empty Project** → rename to **`raw-aviation-production`**

---

## Step 2 — Add PostgreSQL (production database)

**+ New** → **Database** → **PostgreSQL**

This is a completely separate Postgres instance from staging. Production data will live here.

---

## Step 3 — Generate new production secrets

Run this in your terminal. **Do not reuse staging values.**

```bash
echo "APP_KEY_1:  $(openssl rand -base64 32)"
echo "APP_KEY_2:  $(openssl rand -base64 32)"
echo "ADMIN_JWT:  $(openssl rand -base64 32)"
echo "API_TOKEN:  $(openssl rand -base64 32)"
echo "TRANSFER:   $(openssl rand -base64 32)"
echo "ENCRYPTION: $(openssl rand -base64 32)"
echo "JWT_SECRET: $(openssl rand -base64 32)"
```

Save in your password manager, labelled clearly as production. Keep them separate from staging values.

---

## Step 4 — Add the Strapi service (production)

Same setup as staging, with new secret values:

1. **+ New** → **GitHub Repo** → `raw-aviation-blog` → rename to **`strapi`**
2. **Settings → Build:**
   - **Root Directory:** `cms`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
3. **Variables → Raw Editor:**

```
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=false
APP_KEYS=yourProdKey1,yourProdKey2
ADMIN_JWT_SECRET=yourProdValue
API_TOKEN_SALT=yourProdValue
TRANSFER_TOKEN_SALT=yourProdValue
ENCRYPTION_KEY=yourProdValue
JWT_SECRET=yourProdValue
```

4. Deploy → wait for Strapi to start → open the public URL → create your production admin account (use a strong, unique password)

---

## Step 5 — Add a Volume for uploads

Same as staging:

1. Strapi service → **Settings → Volumes → + New Volume**
2. **Mount Path:** `/app/public/uploads`

> For production, consider switching to **Cloudflare R2 or AWS S3** instead of a Railway Volume. Object storage is more reliable long-term and CDN-friendly. This requires adding a Strapi upload provider plugin — a future task.

---

## Step 6 — Add the Next.js service

1. **+ New** → **GitHub Repo** → `raw-aviation-blog` → rename to **`nextjs`**
2. **Settings → Build:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
3. **Variables:**

```
NODE_ENV=production
NEXT_PUBLIC_STRAPI_API_URL=https://strapi.rawaviation.com
```

   > Set this to your production Strapi URL. You may need to set it to the auto-generated `*.up.railway.app` URL first, then update after assigning a custom domain (Step 7).

---

## Step 7 — Assign custom domains

### Next.js (your public website)

1. Next.js service → **Settings → Networking → + Custom Domain**
2. Enter your domain (e.g. `rawaviation.com` or `www.rawaviation.com`)
3. Add the DNS records Railway shows you at your domain registrar (usually a CNAME record)
4. Wait for DNS propagation — Railway auto-provisions HTTPS once it resolves

### Strapi (your CMS)

1. Same process — use a subdomain like `strapi.rawaviation.com` or `cms.rawaviation.com`
2. Once HTTPS is working, add this variable to the Strapi service:
   ```
   PUBLIC_URL=https://strapi.rawaviation.com
   ```
3. Update `NEXT_PUBLIC_STRAPI_API_URL` on the Next.js service to match
4. Trigger a **redeploy of Next.js** — the URL is baked into the build bundle

---

## Step 8 — Lock down CORS for production

Open `cms/config/middlewares.ts` and update the `origin` array to only include your real production domain:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'http://localhost:3000',           // local dev only
      'https://rawaviation.com',         // production
      'https://www.rawaviation.com',     // www variant
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    keepHeaderOnError: true,
  },
},
```

Commit and push.

---

## Step 9 — Remove the debug route

Delete `frontend/src/app/test/page.tsx` before production traffic arrives. Also remove any `console.log` calls in `frontend/src/lib/api/` that would expose API structure in browser DevTools.

Commit and push.

---

## Step 10 — Enable Postgres backups

Railway dashboard → production **Postgres service** → look for **Backups** in settings. Enable them.

If Railway's built-in backups are not sufficient for the plan you're on, set up a scheduled `pg_dump` using a separate Railway cron service.

**What needs backing up:**
- PostgreSQL (all your Strapi content)
- Uploads volume (if using Railway Volume rather than S3/R2)

---

## Step 11 — Set public API permissions

Same as staging: **Settings → Users & Permissions → Roles → Public** → enable `find` and `findOne` for Article, Report, Gallery, Author-profile → **Save**.

---

## Step 12 — Smoke test

Before sharing the URL publicly:

- [ ] Homepage loads with real content
- [ ] Article, report, gallery detail pages work
- [ ] Images load over HTTPS (no mixed-content warnings)
- [ ] Strapi admin at `https://strapi.rawaviation.com/admin` works
- [ ] No browser console errors

---

## Keeping staging and production in sync

**Code changes** flow: local → push → staging auto-redeploys → verify → merge to `main` → production auto-redeploys.

**Content** does not sync automatically. Each environment has its own Postgres. To copy content from staging to production (or vice versa), use **Strapi Transfer** (Admin → Settings → Transfer) using the `TRANSFER_TOKEN_SALT` you set.

**Schema changes** (new content types or fields): deploy to staging first, verify, then deploy to production. Strapi runs migrations on startup.

---

## Quick comparison

| | Staging | Production |
|---|---------|------------|
| Railway project | `raw-aviation-staging` | `raw-aviation-production` |
| Postgres | Separate instance | Separate instance |
| Secrets | Staging-only values | New production values |
| Next.js URL | `*.up.railway.app` | `rawaviation.com` |
| Strapi URL | `*.up.railway.app` | `strapi.rawaviation.com` |
| CORS | Broad | Tight (production domain only) |
| Uploads | Railway Volume | Railway Volume or S3/R2 |
| Backups | Optional | Required |
| `/test` debug route | OK | Remove |
