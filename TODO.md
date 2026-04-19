# TODO

Open work for RAW Aviation Blog. Older checkbox logs lived in git history (`TO_DO_LIST.md` removed).

## High priority

- [ ] **Contact form** — Confirm Strapi `Contact Message` content type, public `create` permission, and end-to-end submit + validation in production.
- [ ] **Deploy** — Railway: [RAILWAY_DEPLOYMENT_PATH.md](./RAILWAY_DEPLOYMENT_PATH.md) + [docs/RAILWAY.md](./docs/RAILWAY.md). Or VPS: [DEPLOYMENT.md](./DEPLOYMENT.md).
- [ ] **Uploads** — Railway volume on Strapi `public/uploads`, or S3/R2 provider so redeploys do not wipe media.
- [ ] **Remove or protect** `frontend/src/app/test/page.tsx` before a public URL.
- [ ] **SEO** — `generateMetadata` on detail routes, `sitemap.xml`, `robots.txt`.

## Medium

- [ ] Rich **block rendering** for articles/reports (headings, lists, links, not only `<p>`).
- [ ] App Router **`not-found.tsx` / `error.tsx`** (and optional error boundary) for failed fetches or missing slugs.
- [ ] Optional **About** single type in Strapi for editable mission/overview copy.

## Reference docs

| Doc | Purpose |
|-----|---------|
| [docs/USER_SYSTEM_ARCHITECTURE.md](./docs/USER_SYSTEM_ARCHITECTURE.md) | Author Profile system and schema notes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Env checklist, security, go-live stages |
| [CLAUDE.md](./CLAUDE.md) | Repo map and dev notes for contributors / AI |
