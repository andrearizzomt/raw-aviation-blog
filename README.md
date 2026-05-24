# RAW Aviation Blog

Aviation articles, airshow reports, and photo galleries. [Strapi 5](https://strapi.io/) (`cms/`) is the headless CMS; [Next.js 16](https://nextjs.org/) (`frontend/`) renders the site.

## Documentation

| Doc | What it's for |
|-----|---------------|
| [docs/STAGING.md](./docs/STAGING.md) | Deploy to Railway — staging setup from scratch (start here) |
| [docs/PRODUCTION.md](./docs/PRODUCTION.md) | Promote staging to production — custom domain, backups, hardening |
| [docs/REFERENCE.md](./docs/REFERENCE.md) | Env var tables, topology, author schema, security checklist, code patterns |
| [TODO.md](./TODO.md) | Current staging status and open tasks |
| [CLAUDE.md](./CLAUDE.md) | Project structure and patterns for contributors and AI |

## Local development

**Requirements:** Node.js 18–22.

```bash
# 1. Start Strapi (start this first — Next.js depends on it)
cd cms
npm install
npm run develop
# Admin: http://localhost:1337/admin
# API:   http://localhost:1337/api

# 2. Start Next.js (separate terminal)
cd frontend
npm install
npm run dev
# Site: http://localhost:3000
```

**Environment files:**
- `frontend/.env.local` → `NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337`
- `cms/.env` → Strapi secrets and DB config (dev placeholders only — never commit real values)

**Optional seed data:**
```bash
cd cms
# Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in cms/.env, then:
npm run seed
# Creates sample authors, articles, reports, and galleries
```

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Zod
- **CMS:** Strapi 5, SQLite locally, PostgreSQL in production
- **Deployment:** Railway (see `docs/STAGING.md`)

## Repository layout

```
raw-aviation-blog/
├── cms/           Strapi CMS
├── frontend/      Next.js app
├── docs/          STAGING.md · PRODUCTION.md · REFERENCE.md
├── TODO.md        Open tasks and staging status
├── CLAUDE.md      Project context for contributors / AI
└── README.md      This file
```
