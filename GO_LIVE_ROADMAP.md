# 🚀 RAW Aviation — Go‑Live Roadmap

> Snapshot taken at the end of the footer / hero / mobile drawer / smooth-theme-transition session.
> Use this as the single source of truth for "what's left before we can launch".
> When an item is done, move it to `TO_DO_LIST.md` under *Recent Achievements* and strike it here.

---

## TL;DR

Roughly **70–75% of the way** to a production‑ready, dockerizable launch.
The UI/frontend is in great shape; what's left is mostly **backend wiring**, **SEO plumbing**, and **deploy infra**.

```
Stage 1  Hard blockers                ~1 day      ← must do
Stage 2  Pre‑launch quality / SEO     ~½–1 day    ← strongly recommended
Stage 3  Dockerization                ~½ day
Stage 4  Deployment to VPS            ~½ day
─────────────────────────────────────────────────
Total                                 ~3 focused days to a real, live site
```

Effort bands used below:
**S** = < 1h · **M** = 1–3h · **L** = ½ day · **XL** = 1+ day

---

## Stage 1 — Hard blockers (won't work in prod without these)

- [ ] **1. Create `Contact Message` content type in Strapi** — fields: `name`, `email`, `subject`, `message`, `createdAt`. Grant **public `create`** permission. _(**M**)_
  - Contact form currently POSTs to `/api/contact-messages` which doesn't exist, so every visitor submission silently fails.
  - Also add server‑side validation (length caps, email format) and basic rate‑limiting / honeypot to avoid spam.
- [ ] **2. PostgreSQL setup + prod config in `cms/config/database.ts`** _(**M**)_
  - SQLite won't survive container restarts or any kind of horizontal scaling cleanly.
  - Add a `DATABASE_CLIENT=postgres` branch that reads `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`.
- [ ] **3. Generate real production secrets** _(**S**)_
  - `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`.
  - Document them in a new `cms/.env.production.example` (the dev defaults currently in `cms/.env` are unsafe in any public environment).
- [ ] **4. Remove `/test` debug page + any remaining verbose logs** _(**S**)_
  - `frontend/src/app/test/page.tsx` leaks internal API shape. CLAUDE.md already flags it.
- [ ] **5. Uploads persistence strategy** _(**M**)_
  - Option A (simple): bind-mount `cms/public/uploads` as a Docker named volume.
  - Option B (recommended for real traffic): configure `@strapi/provider-upload-cloudinary` or an S3-compatible provider (R2, Backblaze B2, etc.).
  - Without either, container redeploys wipe every uploaded image.

**Stage 1 total: ~1 focused day.**

---

## Stage 2 — Strongly recommended before launch

- [ ] **6. Dynamic `generateMetadata()` on detail pages** _(**M**)_
  - `/articles/[slug]`, `/reports/[slug]`, `/galleries/[slug]`.
  - Include `title`, `description`, `openGraph` (title, description, image), `twitter` card. Use the Featured / Main image as OG image.
- [ ] **7. `/sitemap.xml` and `/robots.txt`** _(**S**)_
  - Next.js App Router has first-class support via `app/sitemap.ts` and `app/robots.ts`.
  - Sitemap should enumerate all articles / reports / galleries by slug.
- [ ] **8. Rich block rendering for articles & reports** _(**L**)_
  - Today every Strapi block is rendered as `<p>`. At minimum handle:
    - `heading` (levels 1–4 → `<h2>`–`<h5>` inside an article)
    - `list` (ordered / unordered)
    - `quote`
    - Inline marks: `bold`, `italic`, `underline`, `link`
  - Extract into a reusable `<BlockRenderer blocks={...} />` component shared by articles and reports.
- [ ] **9. Error boundary + `not-found.tsx` + `error.tsx`** _(**S**)_
  - App Router specials. Needed so a single missing slug or Strapi hiccup doesn't white‑screen the site.
- [ ] **10. Zod ↔ TS drift fix** _(**S**)_
  - `FeaturedImage.formats` nullability mismatch (flagged in CLAUDE.md). Sync the TS interface with the Zod schema.
- [ ] **11. Sync TypeScript types with Zod schemas globally** _(**M**)_
  - Use `z.infer<typeof Schema>` as the source of truth where feasible, so the two type systems can't drift again.

**Stage 2 total: ~½–1 day.**

---

## Stage 3 — Dockerization

- [ ] **12. `cms/Dockerfile`** _(**M**)_
  - Multi-stage: `builder` (installs all deps + `strapi build`) → `runner` (production deps only).
  - Node 20 LTS (inside the 18–22 range Strapi supports).
  - `NODE_ENV=production`; entrypoint runs `strapi start`.
- [ ] **13. `frontend/Dockerfile`** _(**M**)_
  - Multi-stage with Next.js standalone output.
  - Set `output: "standalone"` in `next.config.ts`.
  - Copy `.next/standalone`, `.next/static`, and `public` into the runner image.
- [ ] **14. `docker-compose.yml`** _(**M**)_
  - Three services: `postgres`, `cms`, `frontend`.
  - Named volumes: `pg_data`, `strapi_uploads` (unless using S3/Cloudinary).
  - Internal network so `cms` is reachable as `http://cms:1337` from the `frontend` container.
  - `depends_on` with `condition: service_healthy`, plus healthchecks on each service.
- [ ] **15. `.dockerignore` files** for both apps _(**S**)_
  - Exclude `node_modules`, `.next`, `.tmp`, `.env*`, `*.log`.
- [ ] **16. `next.config.ts` image host tweak** _(**S**)_
  - Replace the hard-coded `localhost:1337` `remotePatterns` entry with one driven off an env var (e.g. `NEXT_PUBLIC_STRAPI_API_HOST`) so images load in prod.
- [ ] **17. Local full-stack test: `docker compose up --build` from a clean checkout** _(**M**)_
  - Seed content, create admin user, verify homepage / articles / reports / galleries / about / contact all work end-to-end.

**Stage 3 total: ~½ day (assuming Stage 1 is done).**

---

## Stage 4 — Deployment to VPS

- [ ] **18. Reverse proxy** _(**M**)_
  - Nginx or Caddy. Routes:
    - `yourdomain.com` → `frontend:3000`
    - `cms.yourdomain.com` (or `yourdomain.com/admin` + `/api` / `/uploads`) → `cms:1337`
  - Remember WebSocket upgrade headers if you expose the Strapi admin panel directly.
- [ ] **19. HTTPS via Let's Encrypt** _(**M**)_
  - Caddy is the zero-config option. Nginx + certbot works too but is more setup.
- [ ] **20. CORS config in Strapi** _(**S**)_
  - Restrict `cors.origin` in `cms/config/middlewares.ts` to your real domain(s).
- [ ] **21. Cache / ISR strategy** _(**M**)_
  - CLAUDE.md notes the frontend currently does zero caching. Even a page-level `export const revalidate = 60;` on the list and detail pages would dramatically reduce load and make the site much more resilient to Strapi restarts.
  - Consider adding `cache: "force-cache"` with tags + Strapi webhook → `revalidateTag()` for true on-demand ISR later.
- [ ] **22. Backup plan** _(**M**)_
  - `pg_dump` on a cron (daily), retained for N days off-host (S3 / Backblaze / Hetzner storage box).
  - Snapshot the uploads volume on the same cadence.
- [ ] **23. First admin user + rotate any seeded passwords** _(**S**)_
  - Do this **before** the `/admin` panel is reachable publicly.
- [ ] **24. Basic security hardening** _(**S**)_
  - `helmet` / strict CSP review, disable Strapi admin registration after first user, enforce HTTPS redirect at the proxy.

**Stage 4 total: ~½ day (assuming domain + VPS already exist).**

---

## Stage 5 — Post-launch polish (not blockers)

- [ ] **About single type in Strapi** — editable mission/overview copy for the `/about` page header.
- [ ] **Lightbox for gallery images.**
- [ ] **Social share buttons** for articles and reports.
- [ ] **Individual author pages** (`/authors/[slug]`) listing that author's contributions.
- [ ] **Search** — Meilisearch plugin for Strapi pairs well with a small `/search` route.
- [ ] **Analytics** — Plausible self-hosted fits neatly into the same `docker-compose.yml`.
- [ ] **Content population** — real aviation articles, reports, galleries, author bios, photos.
- [ ] **Newsletter signup** (if you end up wanting one).

---

## Known issues already flagged in `CLAUDE.md`

Carry these along — most map onto items above but worth repeating so they don't get lost:

1. Content block rendering is basic (everything renders as `<p>`). → Stage 2 / item 8.
2. SVG seed images have `formats: null`. Zod was patched, TS was not. → Stage 2 / item 10.
3. No `contact-message` content type exists. → Stage 1 / item 1.
4. `populate=*` is shallow (nested author photos don't come through). Worth revisiting with explicit `populate` objects once content is real.
5. No error boundaries. → Stage 2 / item 9.
6. `/test` page still exists. → Stage 1 / item 4.
7. Seeded admin credentials live in `cms/.env`. → Stage 1 / item 3 and Stage 4 / item 23.

---

## Suggested next session starting point

Pick the smallest unblocker first: **Stage 1 / item 1** — create the `Contact Message` content type in Strapi and grant the public `create` permission. It's a ~1-hour task, it makes an already-shipped UI actually work, and it lets us close the only `⚠️` left in `TO_DO_LIST.md` before we move on to SEO or Docker.
