# Staging Deployment — RAW Aviation Blog

Step-by-step guide to getting the app live on Railway for the first time. No prior experience needed.

**Related docs:**
- Promote to production → [PRODUCTION.md](./PRODUCTION.md)
- All env vars, topology, author schema → [REFERENCE.md](./REFERENCE.md)

---

## What is Railway?

[Railway](https://railway.com) is a cloud hosting platform. You connect it to your GitHub repo, and it builds and deploys your code automatically every time you push. No server management needed.

For this project you get three services running together:

```
raw-aviation-staging
├── PostgreSQL     ← stores all Strapi content
├── strapi         ← the CMS (cms/ folder)
└── nextjs         ← the website (frontend/ folder)
```

**Cost:** Hobby plan at $5/month — enough for staging. See [railway.com/pricing](https://railway.com/pricing).

---

## Current staging status (May 2026)

| Service | URL | Status |
|---------|-----|--------|
| Next.js | https://nextjs-staging-0b02.up.railway.app | ✅ Live |
| Strapi | https://strapi-staging-a15c.up.railway.app | ✅ Live |
| PostgreSQL | internal Railway service | ✅ Live |
| Uploads volume | `/app/public/uploads` | ⬜ Pending — Step 7 |

**Completed:** Steps 1–6, 8, 9b, 10
**Next step:** Step 7 — add Volume so uploaded images survive redeploys

---

## Code fixes made during initial deploy

These issues were only visible in production and are now fixed in the repo:

| Problem | Fix applied |
|---------|-------------|
| Strapi crashed — `Cannot find module 'pg'` | Added `pg` to `cms/package.json` |
| Strapi crashed — `Missing jwtSecret` | Added `JWT_SECRET` to `cms/config/plugins.ts` and Railway variables |
| Railway blocked build — CVE vulnerabilities | Upgraded Next.js from `16.0.5` to `16.0.10` |
| Build failed — TypeScript errors | Rewrote `frontend/src/lib/types/strapi.ts` to derive types from Zod schemas |

---

## Fresh setup — start here

**Requirements before you begin:**
- This repo pushed to your GitHub account
- A terminal app (to generate secrets)
- ~45 minutes

---

### Step 1 — Create a Railway account

1. Go to [railway.com](https://railway.com) → **Sign up with GitHub**
2. Authorise Railway to access your GitHub account
3. Choose **Hobby plan ($5/month)** — includes $5 of credits to start

> Connecting GitHub means Railway watches your repo. Every `git push` automatically triggers a redeploy. You never manually upload code.

---

### Step 2 — Create the project

1. Railway dashboard → **New Project** → **Empty Project**
2. Click the project name top-left → rename to **`raw-aviation-staging`**

> Use "Empty Project" — not "Deploy from GitHub repo". You'll add services manually so each one is configured correctly from the start.

---

### Step 3 — Add PostgreSQL

1. Inside the project → **+ New** → **Database** → **PostgreSQL**
2. Wait for it to appear. Railway names it `Postgres` by default.

That's it. Railway handles the rest. You'll reference this database from Strapi in the next step.

> You don't need to copy the database URL. Strapi will reference it as `${{Postgres.DATABASE_URL}}` — Railway fills that in automatically.

---

### Step 4 — Generate Strapi secrets

Strapi needs six secret values. Run this in your terminal and **do it six times**, saving each output:

```bash
openssl rand -base64 32
```

Or run all at once:

```bash
echo "APP_KEY_1:  $(openssl rand -base64 32)"
echo "APP_KEY_2:  $(openssl rand -base64 32)"
echo "ADMIN_JWT:  $(openssl rand -base64 32)"
echo "API_TOKEN:  $(openssl rand -base64 32)"
echo "TRANSFER:   $(openssl rand -base64 32)"
echo "ENCRYPTION: $(openssl rand -base64 32)"
echo "JWT_SECRET: $(openssl rand -base64 32)"
```

Save these in a password manager. You'll paste them into Railway next.

> **Why so many?** Strapi uses each one for a different security purpose (session encryption, admin login tokens, API tokens, data transfer auth). All must be present or Strapi refuses to start. **Never reuse staging secrets in production.**

---

### Step 5 — Add the Strapi service

1. **+ New** → **GitHub Repo** → `raw-aviation-blog` → rename the service **`strapi`**
2. **Settings → Build:**
   - **Root Directory:** `cms`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`

   > Root Directory tells Railway which folder to build. Your repo has two apps — `cms/` and `frontend/`. Without this, Railway tries to build the whole repo and fails.

3. **Variables → Raw Editor** → paste this block with your real values:

```
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=false
APP_KEYS=yourkey1,yourkey2
ADMIN_JWT_SECRET=yourvalue
API_TOKEN_SALT=yourvalue
TRANSFER_TOKEN_SALT=yourvalue
ENCRYPTION_KEY=yourvalue
JWT_SECRET=yourvalue
```

4. Click **Save** — Railway deploys automatically.
5. Open **Deployments → View logs** and wait.

**You're looking for:**
```
✔ Your server is running at http://0.0.0.0:XXXX
```

**If Strapi crashes, check the [Troubleshooting](#troubleshooting) section below.**

---

### Step 6 — First-time Strapi admin setup

Once Strapi is running:

1. Strapi service → **Settings → Networking → Generate Domain** (if no public URL yet)
2. Open the URL in your browser — you'll see the **Strapi admin registration page**
3. Enter your name, email, and a strong password → click **Let's start**
4. Log in and confirm you can see your content types (Articles, Reports, Galleries, Author Profiles)

> This admin account lives in the Railway Postgres database, not in any `.env` file. Use a different password for production.

---

### Step 7 — Add a Volume for uploads

By default, uploaded images are stored in the container filesystem — they get wiped on every redeploy. A Railway Volume is persistent storage that survives redeploys.

1. Strapi service → **Settings** → scroll to **Volumes** → **+ New Volume**
2. **Mount Path:** `/app/public/uploads`
3. Save — Railway redeploys Strapi with the volume attached.

> `/app/public/uploads` is the full path because Railway places your `cms/` folder at `/app` inside the container, and Strapi writes uploads to `public/uploads` relative to that.

---

### Step 8 — Add the Next.js service

1. **+ New** → **GitHub Repo** → `raw-aviation-blog` → rename to **`nextjs`**
2. **Settings → Build:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm run start`
3. **Variables → Raw Editor:**

```
NODE_ENV=production
NEXT_PUBLIC_STRAPI_API_URL=https://your-strapi-url.up.railway.app
```

   > Replace with your actual Strapi public URL. **No trailing slash.** This URL is embedded into the Next.js JavaScript bundle at build time — if you change it, trigger a redeploy.

4. **Settings → Networking → Generate Domain** to get a public URL
5. Deploy and open the URL — your site should load.

---

### Step 9 — Configure permissions and CORS

#### 9a. Public API permissions (required — do this first)

In the Strapi admin: **Settings → Users & Permissions Plugin → Roles → Public**

Enable `find` and `findOne` for:
- Article
- Report
- Gallery
- Author-profile

Click **Save**.

> Without this, every API call from Next.js returns a 403 error. Strapi locks everything by default.

#### 9b. CORS (allow Next.js to call Strapi)

Open `cms/config/middlewares.ts` in your editor. Replace the `'strapi::cors'` string entry with:

```typescript
{
  name: 'strapi::cors',
  config: {
    origin: [
      'http://localhost:3000',
      'https://your-nextjs-url.up.railway.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    keepHeaderOnError: true,
  },
},
```

Commit and push — Railway redeploys Strapi automatically.

---

### Step 10 — Verify everything works

1. Visit your Next.js URL — homepage loads
2. Go to Strapi admin → create a test article with an image
3. Reload the Next.js homepage — the article appears
4. The image loads (not broken)
5. Click into the article — detail page works

If all of that works, staging is fully operational.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Next.js shows "No articles available" | `NEXT_PUBLIC_STRAPI_API_URL` wrong or missing | Check variable in Railway; ensure no trailing slash; redeploy Next.js |
| Images broken on Next.js | Strapi URL wrong or has trailing slash | Fix `NEXT_PUBLIC_STRAPI_API_URL` and redeploy |
| Strapi won't start — DB error | `DATABASE_URL` wrong or SSL issue | Check `${{Postgres.DATABASE_URL}}` matches Postgres service name; try toggling `DATABASE_SSL` |
| Strapi won't start — missing keys | One of the secrets is empty/missing | Add all required variables in Raw Editor; redeploy |
| Strapi crashes — `Cannot find module 'pg'` | pg driver missing | `npm install pg --save` in `cms/`; commit and push |
| Strapi crashes — `Missing jwtSecret` | `JWT_SECRET` env var not set | Add `JWT_SECRET` to Railway variables; check `cms/config/plugins.ts` |
| Railway blocks build — CVE error | Outdated Next.js version | `npm install next@^16.0.10` in `frontend/`; commit and push |
| Build fails — TypeScript errors | Zod/TS type mismatch | Types in `frontend/src/lib/types/strapi.ts` derive from Zod — check schemas |
| API returns 403 | Public role permissions not set | Enable `find`/`findOne` in Strapi → Settings → Roles → Public |
| Uploads disappear after redeploy | No volume attached | Complete Step 7 |
| CORS error in browser console | Next.js domain not in CORS config | Update `cms/config/middlewares.ts` with Next.js URL; push |

---

## What's next

- Staging working? → [PRODUCTION.md](./PRODUCTION.md) to set up the production environment
- Need to add content? → Log into the Strapi admin and start creating
- Looking for env var tables or architecture details? → [REFERENCE.md](./REFERENCE.md)
- Open tasks? → [../TODO.md](../TODO.md)
