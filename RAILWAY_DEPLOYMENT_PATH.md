# Railway — start here

Click-through order for your **first** Railway environment (staging recommended). Full reference: [docs/RAILWAY.md](./docs/RAILWAY.md).

---

## 1. Account and project

1. Sign up or log in at [railway.com](https://railway.com).
2. **New project** → **Deploy from GitHub** → select this repository.
3. Name the project e.g. `raw-aviation-staging` (keep production separate until this works).

## 2. Add PostgreSQL

1. In the project: **New** → **Database** → **PostgreSQL**.
2. Open the Postgres service → **Variables** — you will reference **`DATABASE_URL`** from Strapi (e.g. `${{Postgres.DATABASE_URL}}` — the service name must match yours in the Railway dashboard).

## 3. Strapi (`cms`)

1. **New** → **GitHub Repo** (same repo) to add a second service (or reconfigure the auto-created one).
2. **Settings**:
   - **Root directory**: `cms`
   - **Build command** (if you override): `npm ci && npm run build`
   - **Start command**: `npm run start`
3. **Variables** (minimum — full table in [docs/RAILWAY.md](./docs/RAILWAY.md)):

   - `NODE_ENV` = `production`
   - `DATABASE_CLIENT` = `postgres`
   - `DATABASE_URL` = reference to Postgres (see above)
   - Generate **unique** values per environment: `APP_KEYS` (comma-separated Strapi keys), `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY` (e.g. `openssl rand -base64 32` each)

4. **Deploy** and watch logs until Strapi is healthy.
5. Open the service **public URL** and complete **Strapi admin** first-time setup in the browser.

**Uploads:** after Strapi runs, add a **Railway Volume** on this service for persistent `public/uploads` (path details in [docs/RAILWAY.md](./docs/RAILWAY.md)).

## 4. Next.js (`frontend`)

1. **New** → same repo again.
2. **Settings** → **Root directory**: `frontend`
3. **Variables** — set **before** build:

   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_STRAPI_API_URL` = your Strapi service **public HTTPS origin** (e.g. `https://xxxx.up.railway.app`, no trailing path)

4. Build / start: `npm ci && npm run build` / `npm run start` if you override defaults.
5. Deploy and open the frontend public URL.

## 5. Wire and verify

- In Strapi, configure **CORS** so your Next origin can call the API.
- Under **Settings → Users & permissions → Roles → Public**, confirm `find` / `findOne` (and contact `create` if used) match what the site needs.

## 6. Production later

Duplicate the whole pattern: **new Railway project** (or a separate Railway **Environment**), **new Postgres**, **new secrets** (never reuse staging secrets), new Strapi + Next. See [docs/RAILWAY.md](./docs/RAILWAY.md) for staging vs production options.

---

## Where to read next

| Topic | File |
|--------|------|
| Service layout, env tables, volumes, security | [docs/RAILWAY.md](./docs/RAILWAY.md) |
| General production checklist (VPS, CORS, SSL) | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Open tasks | [TODO.md](./TODO.md) |
