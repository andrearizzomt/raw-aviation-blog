# TODO

Open work for RAW Aviation Blog. Older checkbox logs lived in git history (`TO_DO_LIST.md` removed).

## Staging deployment — current status

**Live at:** https://nextjs-staging-0b02.up.railway.app

| Step | Status |
|------|--------|
| Railway project + PostgreSQL | ✅ Done |
| Strapi service deployed + admin set up | ✅ Done |
| Next.js service deployed | ✅ Done |
| Public API permissions set (find/findOne) | ✅ Done |
| Uploads volume on Strapi (`/app/public/uploads`) | ⬜ Todo |
| CORS locked to staging domain | ⬜ Todo |
| Test content added (verify full flow) | ⬜ Todo |

## High priority

- [ ] **Uploads volume** — Railway: Strapi service → Settings → Volumes → `/app/public/uploads`
- [ ] **CORS** — update `cms/config/middlewares.ts` to include `https://nextjs-staging-0b02.up.railway.app`
- [ ] **Test content** — add an author, article, report, gallery in Strapi admin; verify they appear on the site with images
- [ ] **Contact form** — Confirm Strapi `Contact Message` content type, public `create` permission, end-to-end submit + validation
- [ ] **Remove or protect** `frontend/src/app/test/page.tsx` before production
- [ ] **SEO** — `generateMetadata` on detail routes, `sitemap.xml`, `robots.txt`

## Medium

- [ ] Rich **block rendering** for articles/reports (headings, lists, links, not only `<p>`)
- [ ] App Router **`not-found.tsx` / `error.tsx`** (and optional error boundary) for failed fetches or missing slugs
- [ ] Optional **About** single type in Strapi for editable mission/overview copy

## Production (after staging is fully verified)

- [ ] Create `raw-aviation-production` Railway project — follow [docs/PRODUCTION.md](./docs/PRODUCTION.md)
- [ ] Generate new secrets (never reuse staging secrets)
- [ ] Assign custom domain
- [ ] Enable Postgres backups
- [ ] Remove debug `/test` route

## Reference docs

| Doc | Purpose |
|-----|---------|
| [docs/STAGING.md](./docs/STAGING.md) | Staging deploy guide + current status + troubleshooting |
| [docs/PRODUCTION.md](./docs/PRODUCTION.md) | Production deploy guide |
| [docs/REFERENCE.md](./docs/REFERENCE.md) | Env vars, topology, author schema, code patterns, security |
| [CLAUDE.md](./CLAUDE.md) | Repo map and dev notes for contributors / AI |
