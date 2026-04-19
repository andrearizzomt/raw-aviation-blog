# Railway deployment guide (RAW Aviation Blog)

**First deploy?** Use the step-by-step path: [RAILWAY_DEPLOYMENT_PATH.md](../RAILWAY_DEPLOYMENT_PATH.md) in the repo root.

This document matches the **monorepo layout** in this repository: `cms/` (Strapi 5) + `frontend/` (Next.js 16) + **PostgreSQL** in production.

## Do you need Docker first?

**No.** Railway can build Node apps with **Nixpacks** (default): set the **root directory** per service to `cms` or `frontend`, and Railway runs `npm install`, `npm run build`, and your start command.

**When Docker is worth adding later**

- You need **identical** builds locally and in CI.
- Nixpacks struggles with a **native dependency** (uncommon if you use Postgres only and skip SQLite in prod).
- You want a **single image** that runs both processes (not recommended here—keep three services).

Start without Docker; add a `Dockerfile` only if you hit reproducibility or build issues.

---

## Recommended Railway topology

Use **one PostgreSQL service + one Strapi service + one Next.js service** per environment (staging and production each get their own trio).

```
┌─────────────────────────────────────────────────────────────┐
│  Environment: staging  OR  production                      │
├─────────────────────────────────────────────────────────────┤
│  [PostgreSQL]  ←── private network ──→  [Strapi :1337]     │
│                                                    ↑         │
│                                    NEXT_PUBLIC_STRAPI_*      │
│                                                    │         │
│                                            [Next.js :3000]   │
└─────────────────────────────────────────────────────────────┘
```

| Service        | Repo root directory | Install / build | Start command   | Listens on                          |
|----------------|--------------------|-----------------|-----------------|-------------------------------------|
| **PostgreSQL** | *(Railway template)* | n/a             | n/a             | internal hostname + `DATABASE_URL` |
| **Strapi**     | `cms`              | `npm ci` → `npm run build` | `npm run start` | `PORT` (Railway injects; Strapi reads `PORT`) |
| **Next.js**    | `frontend`         | `npm ci` → `npm run build` | `npm run start` | `PORT`                             |

**Notes**

- Railway sets **`PORT`** per service. Strapi already uses `env.int('PORT', 1337)` in `cms/config/server.ts`—set nothing static; use Railway’s `PORT`.
- Strapi **`HOST`**: default `0.0.0.0` is correct for containers.
- Next binds to `PORT` by default in production.

---

## Staging and production side by side

Pick **one** of these patterns.

### Option A — Two Railway projects (simple mental model)

| Project              | Branch (example) | Domains                          |
|----------------------|------------------|----------------------------------|
| `…-staging`          | `develop`        | `*.up.railway.app` or staging custom domain |
| `…-production`       | `main`           | Production custom domain         |

- **Pros:** Clear separation, separate Postgres and volumes, no accidental cross-wiring.
- **Cons:** Two places to update settings (or automate with Terraform later).

### Option B — One project, Railway **Environments**

Railway lets you duplicate **staging** vs **production** environments inside the same project (separate variables, often separate databases and URLs).

- **Pros:** One project; promote patterns; shared team access.
- **Cons:** Easier to misconfigure a variable if names are copy-pasted—use strict naming (prefix `STAGING_` only in docs, not in code—use separate variable *values* per environment).

**Recommendation:** Use **Option A** until you are comfortable; migrate to **Option B** if you want a single project.

**Critical rule:** Staging and production must use **different** Postgres instances, **different** Strapi secrets (`APP_KEYS`, JWT secrets, salts), and **different** volumes (if used). Never point staging Next at production Strapi or vice versa.

---

## Environment variables

### PostgreSQL (Railway-provided)

Railway’s Postgres plugin exposes **`DATABASE_URL`**. Prefer referencing it from Strapi with a [variable reference](https://docs.railway.com/develop/variables#referencing-variables-from-other-services), e.g. `${{Postgres.DATABASE_URL}}`, so you never paste credentials by hand.

### Strapi (`cms` service)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_CLIENT` | Yes | `postgres` |
| `DATABASE_URL` | Yes | From Postgres service (private URL on Railway) |
| `DATABASE_SSL` | Often | Railway: try `false` on **private** networking; if the client requires SSL for a given URL, use `true` and tune `DATABASE_SSL_REJECT_UNAUTHORIZED` per Strapi/pg docs |
| `HOST` | Optional | Default `0.0.0.0` is fine |
| `PORT` | Auto | Injected by Railway—do not hardcode |
| `APP_KEYS` | Yes | Strapi app keys (comma-separated list in Strapi env format) |
| `ADMIN_JWT_SECRET` | Yes | Admin JWT |
| `API_TOKEN_SALT` | Yes | API token salt |
| `TRANSFER_TOKEN_SALT` | Yes | Transfer token salt |
| `ENCRYPTION_KEY` | Yes | Encryption key |

Generate secrets once per environment (do not reuse staging secrets in prod):

```bash
openssl rand -base64 32   # repeat for each secret; use independent values
```

Strapi expects **`APP_KEYS`** as a comma-separated list of keys (see [Strapi server configuration](https://docs.strapi.io/dev-docs/configurations/server)); generate several keys for rotation support.

**Optional but recommended for correct URLs / webhooks / admin links**

Strapi’s `cms/config/server.ts` in this repo does not yet define a public `url`. If admin or media URLs are wrong behind Railway’s proxy, add a `url` field driven by `env('PUBLIC_URL')` and set **`PUBLIC_URL`** to your public Strapi base URL (e.g. `https://strapi-production.up.railway.app`). That is a small code change when you see incorrect absolute links.

### Next.js (`frontend` service)

| Variable | Required | When to set |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `NEXT_PUBLIC_STRAPI_API_URL` | Yes | **At build time** — must be the public Strapi base URL for *this* environment (e.g. `https://your-strapi-staging.up.railway.app`), **no** trailing slash issues: keep consistent with how you call `/api/...` |
| `PORT` | Auto | Railway injects |

`NEXT_PUBLIC_*` variables are inlined into the client bundle during **`next build`**. In Railway, ensure they are set on the **frontend** service **before** build (same as Vercel). If you change only runtime vars without rebuilding, the browser bundle can still point at the old API.

**Duplicate URL usage:** This codebase uses `NEXT_PUBLIC_STRAPI_API_URL` for both REST calls and concatenating media paths. One variable is enough if it is exactly the Strapi origin users and Next can reach over HTTPS.

---

## Data persistence (Postgres + uploads)

### Database

- **PostgreSQL on Railway** persists data for the life of that database service. Redeploying **Strapi** does not wipe Postgres.
- Run Strapi once to apply schema (first deploy runs migrations as part of Strapi startup when configured correctly).
- **Backups:** Enable Railway Postgres backups / export on a schedule for production.

### Uploads (Strapi default: local disk)

Strapi stores files under **`cms/public/uploads/`** (see `.gitignore`). Container filesystem is **ephemeral** unless you attach storage.

| Strategy | Persists across redeploy? | Notes |
|----------|---------------------------|--------|
| **Default disk only** | **No** | Uploads lost when the container is replaced |
| **Railway Volume** | **Yes** | Mount a volume at `public/uploads` (service root = `cms`, so mount path **`/app/public/uploads`** if Railway’s working directory is the app root—confirm in deploy logs; path must match where Strapi writes) |
| **S3-compatible (e.g. R2, S3)** | **Yes** | Best for scale and CDN; requires `@strapi/provider-upload-aws-s3` (or similar) and env vars—code change in Strapi |

**Practical path for testing:** attach a **small Railway Volume** to the Strapi service at the uploads directory so redeploys do not delete media.

**Production path:** move to **object storage** + CDN when traffic or reliability requirements grow.

---

## Networking and security checklist

1. **HTTPS only** for public Strapi and Next URLs.
2. **CORS:** When you add production domains, configure Strapi CORS so only your Next origins can call the API (middleware / Strapi settings—not fully customized in this repo yet).
3. **Secrets:** Store all sensitive values in Railway **Variables**; mark as **secret**. Never commit real `.env` files.
4. **Admin panel:** Use a strong admin password; consider restricting `/admin` by IP or VPN only if Railway plan supports it (otherwise rely on password + 2FA if Strapi/plugin supports it).
5. **Repo:** Confirm `.env`, `.env.local`, and `cms/.tmp/` remain gitignored.
6. **Remove or protect** debug routes (e.g. `frontend/src/app/test/page.tsx`) before production.

---

## Suggested first-time deploy order

1. Create **Postgres** service → copy / reference `DATABASE_URL`.
2. Create **Strapi** service (`cms`), set env vars, deploy, open logs, fix DB/SSL if needed, complete Strapi admin bootstrap in browser.
3. Attach **Volume** to Strapi for `public/uploads` (or plan S3).
4. Create **Next** service (`frontend`), set `NEXT_PUBLIC_STRAPI_API_URL` to Strapi’s **public** URL, deploy.
5. Assign **custom domains** (optional), enable **healthchecks** in Railway for each web service.
6. Clone the project (or environment) for **production** with new secrets and new Postgres.

---

## Quick reference — commands

| Service | Build | Start |
|---------|-------|-------|
| Strapi | `npm ci && npm run build` | `npm run start` |
| Next   | `npm ci && npm run build` | `npm run start` |

Use `npm ci` in CI/Railway for reproducible installs when `package-lock.json` is committed (both apps have lockfiles).

---

## Related repo files

- `cms/config/database.ts` — Postgres via `DATABASE_CLIENT` + `DATABASE_URL`
- `cms/config/server.ts` — `HOST`, `PORT`, `APP_KEYS`
- `cms/config/admin.ts` — admin JWT, salts, encryption
- `frontend/next.config.ts` — image `remotePatterns` derived from `NEXT_PUBLIC_STRAPI_API_URL` for non-localhost deploys
- `DEPLOYMENT.md` (repo root) — general production checklist (CORS, images, security, go-live stages)
