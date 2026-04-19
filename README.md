# RAW Aviation Blog

Aviation articles, airshow **reports**, and **galleries**. [Strapi 5](https://strapi.io/) (`cms/`) is the headless CMS; [Next.js](https://nextjs.org/) (`frontend/`) renders the site.

## Documentation map

| Document | Use it for |
|----------|------------|
| [RAILWAY_DEPLOYMENT_PATH.md](./RAILWAY_DEPLOYMENT_PATH.md) | First-time Railway clicks (staging or prod) |
| [docs/README.md](./docs/README.md) | Index of everything under `docs/` |
| [docs/RAILWAY.md](./docs/RAILWAY.md) | Railway topology, env vars, volumes, staging vs prod |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production checklist, go-live stages, VPS-style steps |
| [TODO.md](./TODO.md) | Current open tasks |
| [docs/USER_SYSTEM_ARCHITECTURE.md](./docs/USER_SYSTEM_ARCHITECTURE.md) | Author profiles, attribution, Strapi fields |
| [CLAUDE.md](./CLAUDE.md) | Project layout and conventions for contributors / AI |

## Local development

**Requirements:** Node.js 18–22 (see `cms/package.json` `engines`).

1. **CMS** (start first — the frontend calls it on every request):

   ```bash
   cd cms
   npm install
   npm run develop
   ```

   Admin: `http://localhost:1337/admin` — API: `http://localhost:1337/api`.

2. **Frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   App: `http://localhost:3000`.

3. **Environment**

   - `frontend/.env.local`: `NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337`
   - `cms/.env`: Strapi keys and DB — create from Strapi docs / team template (never commit real secrets).

Optional seed data: see `CLAUDE.md` (`npm run seed` in `cms/` with `SEED_*` variables).

## Tech stack (short)

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, Zod.
- **CMS:** Strapi 5, SQLite locally, PostgreSQL in production.
- **Deploy:** Railway or any Node + Postgres host; Docker is optional (see `docs/RAILWAY.md` and `DEPLOYMENT.md`).

## Repository layout

```
raw-aviation-blog/
├── cms/           Strapi
├── frontend/      Next.js
├── docs/          `README.md`, `RAILWAY.md`, `USER_SYSTEM_ARCHITECTURE.md`
├── RAILWAY_DEPLOYMENT_PATH.md   First Railway deploy (click path)
├── CLAUDE.md      Contributor / AI context
├── DEPLOYMENT.md  Production + go-live
├── TODO.md        Backlog
└── README.md      This file
```
