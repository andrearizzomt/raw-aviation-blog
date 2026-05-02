# Deploying RAW Aviation Blog on Railway — Staging Guide

This guide walks you through deploying the **RAW Aviation Blog** (Strapi CMS + Next.js frontend + PostgreSQL database) on Railway, from zero to a live staging environment. No prior Railway experience needed.

**Related docs:**
- Technical reference (env var tables, topology): [docs/RAILWAY.md](./docs/RAILWAY.md)
- Once staging works → promote to production: [docs/RAILWAY_PRODUCTION.md](./docs/RAILWAY_PRODUCTION.md)
- General production checklist: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## What is Railway?

[Railway](https://railway.com) is a cloud platform where you can deploy web apps, databases, and services without managing servers. It reads your GitHub repo, builds your code automatically, and gives each service a public URL. Think of it like Heroku but more modern.

**What you get:**
- Three services running together: **PostgreSQL** (your database), **Strapi** (your CMS), **Next.js** (your website)
- Each service gets its own public URL
- Re-deploys happen automatically whenever you push to GitHub
- Environment variables are stored securely in the Railway dashboard

**Cost:** Railway has a **Hobby plan at $5/month** (includes $5 of free credits). That is enough to run this full stack for testing/staging. See [railway.com/pricing](https://railway.com/pricing).

---

## Before you start

You need:
- [ ] This repository pushed to **your** GitHub account (or you have access to it)
- [ ] A Railway account (created below)
- [ ] A terminal (to generate secure random secrets)
- [ ] About 30–45 minutes

---

## Step 1 — Create a Railway account

1. Go to [railway.com](https://railway.com) and click **Sign up**.
2. Sign up with **GitHub** — this lets Railway access your repositories without extra steps.
3. When prompted, **authorise Railway** to access your GitHub account.
4. Railway will ask you to set up a plan. Choose **Hobby ($5/month)** to get started. The free trial gives you $5 of credits to test with.

> **Why connect GitHub?** Railway watches your repository. When you push code, it automatically rebuilds and redeploys your services. You won't need to manually upload code.

---

## Step 2 — Create a new Railway project

1. In the Railway dashboard, click **New Project**.
2. Select **Deploy from GitHub repo**.
3. Find and select your `raw-aviation-blog` repository.
4. Railway will create a project and may auto-detect the first service. **Ignore or delete any auto-created service** for now — you will set them up properly in the steps below.
5. In the top-left of the project, click the project name and rename it to something like **`raw-aviation-staging`**.

> **Why "staging" in the name?** You will later create a separate project called `raw-aviation-production`. Keeping them separate means you can break things in staging without affecting your live site.

---

## Step 3 — Add PostgreSQL (the database)

Strapi needs a database to store all your content. In Railway, you add a pre-configured PostgreSQL service.

1. Inside your project, click **+ New** → **Database** → **PostgreSQL**.
2. Railway creates a Postgres service. Click on it to open its settings.
3. Go to the **Variables** tab — you will see `DATABASE_URL` listed. This is a full connection string that looks like `postgresql://postgres:password@hostname:port/railway`. **You do not need to copy it** — you will reference it by name in the Strapi service.

> **What is DATABASE_URL?** It is the address + credentials Strapi uses to connect to Postgres. Railway lets you reference it as `${{Postgres.DATABASE_URL}}` so you never have to paste raw credentials around.

---

## Step 4 — Generate Strapi secrets (do this before adding the service)

Strapi needs several secret keys for security (encrypting sessions, JWTs, tokens). You must generate unique values for each environment. **Never reuse staging secrets in production.**

Open your terminal and run this command **five times**, saving each output:

```bash
openssl rand -base64 32
```

Label each one as you go:
- `APP_KEYS` — run the command **twice** and join both outputs with a comma (e.g. `abc123==,def456==`)
- `ADMIN_JWT_SECRET` — one value
- `API_TOKEN_SALT` — one value
- `TRANSFER_TOKEN_SALT` — one value
- `ENCRYPTION_KEY` — one value

> **Why five secrets?** Strapi uses them independently for different security functions (admin login sessions, API tokens, data transfer auth, encryption). They must all be present or Strapi will refuse to start.

Keep these values somewhere safe (a password manager is ideal). You will paste them into Railway in the next step.

---

## Step 5 — Add the Strapi service (`cms`)

1. In your project, click **+ New** → **GitHub Repo** → select `raw-aviation-blog` again.
2. A new service is created. Click on it and rename it **`strapi`** (or `cms`).
3. Go to **Settings** → **Build** and set:
   - **Root Directory**: `cms`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`

   > **What is "Root Directory"?** Your repo has two apps (`cms/` and `frontend/`). Setting the root directory tells Railway which folder this service lives in, so it builds the right app.

4. Go to the **Variables** tab and add the following (click **+ New Variable** for each):

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_CLIENT` | `postgres` |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `DATABASE_SSL` | `false` |
   | `APP_KEYS` | your two generated keys joined by a comma |
   | `ADMIN_JWT_SECRET` | your generated value |
   | `API_TOKEN_SALT` | your generated value |
   | `TRANSFER_TOKEN_SALT` | your generated value |
   | `ENCRYPTION_KEY` | your generated value |

   > **About `DATABASE_SSL`:** Railway's internal Postgres uses plain TCP between services on its private network. Setting `false` avoids an SSL handshake error on first connect. If you later point Strapi at an external database, you may need `true`.

   > **About `${{Postgres.DATABASE_URL}}`:** This is a Railway "variable reference". When the service starts, Railway replaces it with the actual value from your Postgres service. The part before the dot (`Postgres`) must match your Postgres service name in the dashboard. If you renamed it, update accordingly.

5. Click **Deploy** and watch the **Logs** tab.

**What to look for in the logs:**
- `✔ Strapi server is ready!` or similar — Strapi started successfully
- Any `Error` line related to database — usually means SSL or `DATABASE_URL` is wrong
- Build errors — usually means a missing env var or wrong root directory

**Common issues:**
- **`database ssl` error** → try `DATABASE_SSL=true` and add `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
- **`Cannot find module` build error** → check that Root Directory is `cms` not the repo root
- **Strapi keeps restarting** → check all five secret env vars are present and not empty

---

## Step 6 — Complete Strapi admin setup (first boot)

Once Strapi is running:

1. In the Strapi service, go to the **Settings** tab → find the **Public URL** (looks like `https://xxxx.up.railway.app`). Click it to open Strapi in the browser.
2. You will see the **Strapi admin registration page**. Fill in your name, email, and a strong password. This creates your admin account.
3. Log in to the admin panel and verify you can see your content types (Articles, Reports, Galleries, Author Profiles).

> **Important:** This admin account is specific to this staging database. Use a different (stronger) password for production. Strapi admin credentials are stored in Postgres — they do not come from your `.env` file.

---

## Step 7 — Add a Volume for uploads (persistent file storage)

By default, files uploaded to Strapi (images, PDFs) are stored in the container's file system, which is wiped on every redeploy. A **Railway Volume** attaches persistent storage that survives redeploys.

1. Go to your **Strapi service** → **Settings** → scroll down to **Volumes**.
2. Click **+ New Volume**.
3. Set the **Mount Path** to `/app/public/uploads`.
4. Save. Railway will redeploy the Strapi service with the volume attached.

> **Why `/app/public/uploads`?** When Railway builds your `cms` folder, the working directory inside the container is `/app`. Strapi writes uploads to `public/uploads` relative to that, so the full path is `/app/public/uploads`.

> **Alternative — Object Storage (S3/R2):** For production or if you have a lot of media, an S3-compatible provider (e.g. Cloudflare R2, AWS S3) is more robust and CDN-ready. This requires installing a Strapi upload provider plugin. Start with a Railway Volume for staging.

---

## Step 8 — Add the Next.js service (`frontend`)

1. In your project, click **+ New** → **GitHub Repo** → select `raw-aviation-blog` again.
2. Rename the new service **`nextjs`** (or `frontend`).
3. Go to **Settings** → **Build** and set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run start`
4. Go to the **Variables** tab and add:

   | Variable | Value |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `NEXT_PUBLIC_STRAPI_API_URL` | your Strapi service public URL (e.g. `https://xxxx.up.railway.app`) |

   > **How to get the Strapi URL:** Go to your Strapi service → **Settings** → copy the **Public URL**. It should be `https://...up.railway.app`. No trailing slash.

   > **Why must this be set before build?** Variables prefixed with `NEXT_PUBLIC_` are embedded into the JavaScript bundle at build time. If you set or change this variable, Railway must rebuild the Next.js service for it to take effect.

5. Click **Deploy** and watch the logs. You should see `Next.js started` or similar.

6. Open the **Public URL** for the Next.js service — your site should load and pull content from Strapi.

---

## Step 9 — Configure Strapi CORS and content permissions

By default, Strapi blocks cross-origin API requests. You need to allow your Next.js domain to call the Strapi API.

### 9a. CORS (allow Next.js to call Strapi)

For staging, Railway's `*.up.railway.app` domains are fine to allow broadly. You will tighten this for production.

In `cms/config/middlewares.ts`, the `strapi::cors` entry needs your Next.js URL in `origin`. For now you can add it manually:

1. Open `cms/config/middlewares.ts` in your editor.
2. Find the `'strapi::cors'` entry. If it is a string, replace it with an object:

   ```typescript
   {
     name: 'strapi::cors',
     config: {
       origin: [
         'http://localhost:3000',                       // local dev
         'https://your-nextjs-service.up.railway.app',  // staging
       ],
       methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
       headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
       keepHeaderOnError: true,
     },
   },
   ```

3. Commit and push. Railway will redeploy Strapi automatically.

### 9b. Public API permissions (allow the frontend to read content)

1. In the Strapi admin panel, go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**.
2. For each content type (Article, Report, Gallery, Author-profile), enable:
   - `find` — to list items
   - `findOne` — to get a single item by slug
3. Click **Save**.

> **Why is this needed?** Strapi locks all content types by default. The "Public" role is what unauthenticated requests (like Next.js fetching articles) use. Without enabling `find`/`findOne`, every API call returns a 403 error.

---

## Step 10 — Verify the full flow

1. Visit your **Next.js public URL** — the homepage should load with articles, reports, and galleries.
2. Click into an article, report, or gallery — the detail page should work.
3. Go back to the Strapi admin and create a test article. Reload the Next.js homepage — it should appear (within a few seconds, as there is no caching yet).
4. Upload an image to a Strapi content item. Reload and verify the image loads on the Next.js side.

If everything works, your staging environment is live.

---

## Troubleshooting quick reference

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Next.js shows no content / blank homepage | `NEXT_PUBLIC_STRAPI_API_URL` wrong or unset | Check the variable in Railway and rebuild |
| Images don't load (broken img tags) | Strapi URL has trailing slash or wrong value | Remove trailing slash from `NEXT_PUBLIC_STRAPI_API_URL` |
| Strapi won't start (DB error) | `DATABASE_URL` wrong or SSL mismatch | Check variable reference; try toggling `DATABASE_SSL` |
| Strapi won't start (missing keys) | One of the 5 secrets is empty | Add all 5 variables; redeploy |
| API returns 403 on articles | Public role permissions not set | Enable `find`/`findOne` in Strapi → Settings → Roles → Public |
| Uploads disappear after redeploy | No volume attached | Re-do Step 7 |
| CORS error in browser console | Strapi `middlewares.ts` doesn't include Next.js origin | Update CORS config (Step 9a) and push |

---

## What's next

- **Staging is working?** → Follow [docs/RAILWAY_PRODUCTION.md](./docs/RAILWAY_PRODUCTION.md) to set up the production environment.
- **Need to add real content?** → Log into the Strapi admin on your staging URL and start creating.
- **Technical reference** (env var tables, topology diagrams) → [docs/RAILWAY.md](./docs/RAILWAY.md)
- **Open tasks / known issues** → [TODO.md](./TODO.md)
