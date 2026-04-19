# Deployment and go-live

Checklists for shipping the RAW Aviation Blog (Next.js + Strapi + PostgreSQL). **Railway:** quick path [RAILWAY_DEPLOYMENT_PATH.md](./RAILWAY_DEPLOYMENT_PATH.md), details [docs/RAILWAY.md](./docs/RAILWAY.md).

---

## Environment variables

### Frontend (Next.js)

- [ ] `NEXT_PUBLIC_STRAPI_API_URL` — production or staging Strapi **origin** (HTTPS), set **before** `next build` on the host.
- [ ] Remove hardcoded localhost usage in any debug routes before launch.

### CMS (Strapi)

- [ ] `DATABASE_CLIENT=postgres` and `DATABASE_URL` (or discrete host/user/password) on the server.
- [ ] Production admin password and Strapi secrets (`APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `ENCRYPTION_KEY`) — unique per environment; never commit real values.
- [ ] CORS restricted to real frontend origins (`cms/config/middlewares.ts` when ready).
- [ ] Production email provider (if using email features).

### Configuration

- [ ] **Next.js images** — `frontend/next.config.ts` uses `NEXT_PUBLIC_STRAPI_API_URL` to allow `/uploads/**` for `<Image>`; no manual hostname edit needed if that env is set at build time.
- [ ] **Strapi uploads** — local disk needs a **volume** (Railway/Docker) or **S3-compatible** provider; otherwise uploads disappear on redeploy.
- [ ] Review API limits in `cms/config/api.ts` if needed.

---

## Security

- [ ] HTTPS everywhere (hosting provider or reverse proxy).
- [ ] CORS and public **Users & permissions** roles reviewed (minimal public access).
- [ ] Backups for Postgres and uploads.
- [ ] Rate limiting / spam protection for public `create` endpoints (e.g. contact).
- [ ] Remove or protect debug routes (`frontend/src/app/test/page.tsx`).
- [ ] Logging: avoid leaking secrets in build or runtime logs.

---

## Infrastructure (choose one path)

**Railway (managed):**

- [ ] Follow [RAILWAY_DEPLOYMENT_PATH.md](./RAILWAY_DEPLOYMENT_PATH.md) — Postgres + Strapi (`cms`) + Next (`frontend`), volume for uploads.
- [ ] Staging vs production: separate projects or Railway environments; separate DB and secrets ([docs/RAILWAY.md](./docs/RAILWAY.md)).

**VPS / self-managed:**

- [ ] Reverse proxy (Nginx, Caddy, etc.) → Next and Strapi; TLS (e.g. Let’s Encrypt).
- [ ] Process manager or containers for Node services.
- [ ] Monitoring and alerts.

**Optional — Docker (e.g. VPS or portable stack):**

- [ ] Multi-stage `Dockerfile` in `cms` and `frontend`, `docker-compose.yml` with Postgres + named volumes for DB and `public/uploads` — only if you want compose-based prod; not required for Railway Nixpacks.

---

## Pre-launch

- [ ] Smoke-test all list and detail routes against production Strapi.
- [ ] Images and media URLs over HTTPS.
- [ ] Pagination and dynamic routes.
- [ ] SEO basics (titles, meta; sitemap/robots when implemented).
- [ ] Strapi content workflow tested by an editor.

---

## Post-launch

- [ ] Analytics / error monitoring (if desired).
- [ ] Backup restore drill.
- [ ] Document where env vars and domains live (this repo + host dashboard).

---

## Go-live roadmap (condensed)

Priorities before a **public** URL (effort: **S** short, **M** medium, **L** longer):

**Blockers**

1. **M** — Contact submissions: Strapi **Contact Message** (or equivalent), public `create`, validation, spam/rate limits.
2. **M** — **Uploads persistence** (volume or object storage).
3. **S** — Production secrets on the host only; rotate anything that was ever in dev `.env` files.
4. **S** — Remove `/test` or protect it.

**Strongly recommended**

5. **M** — `generateMetadata` on `/articles/[slug]`, `/reports/[slug]`, `/galleries/[slug]` (title, description, OG image).
6. **S** — `sitemap.ts` / `robots.ts` in the Next.js app.
7. **M** — Richer Strapi **blocks** rendering (headings, lists, links).
8. **S** — `not-found.tsx` / `error.tsx` for failed API or missing slugs.
9. **S** — Strapi **CORS** locked to your real Next origins.

**After traffic or editorial load**

10. **M** — Caching / `revalidate` so every page hit does not hammer Strapi.
11. **M** — Off-site **backups** (Postgres dumps + upload storage).

**Note:** PostgreSQL wiring exists in `cms/config/database.ts` (`DATABASE_CLIENT`, `DATABASE_URL`). You still must provision Postgres on each environment and set variables on the host.

---

## Related files in the repo

- `cms/config/database.ts` — SQLite (dev) / Postgres (prod).
- `cms/config/server.ts`, `cms/config/admin.ts` — server and admin secrets.
- `frontend/next.config.ts` — Strapi image host from `NEXT_PUBLIC_STRAPI_API_URL`.
