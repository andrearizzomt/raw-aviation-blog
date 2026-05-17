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
| Uploads volume on Strapi (`/app/public/uploads`) | ✅ Done |
| CORS locked to staging domain | ⬜ Todo |
| Force dynamic rendering on all content pages | ✅ Done |
| Test content added (verify full flow) | ⬜ Todo |

## High priority

- [ ] **CORS** — update `cms/config/middlewares.ts` to replace bare `'strapi::cors'` with explicit origin allowlist (`http://localhost:3000`, `https://nextjs-staging-0b02.up.railway.app`), then push
- [ ] **Test content** — add an article, report, gallery in Strapi admin; verify they appear on the site with images loading correctly
- [x] **Contact form** ✅ — working on staging
  - Email delivery via Resend (`RESEND_API_KEY`, `CONTACT_EMAIL_TO` on Next.js service)
  - Cloudflare Turnstile CAPTCHA (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`)
  - Spam protection: honeypot + time-check + rate limiting (3/IP/hour)
  - Field validation: name/subject letters only, email format, all fields required
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

## Infrastructure / DNS migration (do when blog goes live on rawaviation.mt)

Current state:
- `rawaviation.mt` → Netlify (landing page) — DNS managed via Netlify's NS1 nameservers
- `nextjs-staging-0b02.up.railway.app` → Railway (blog, staging)
- Email MX records (Namecheap Private Email) added to Netlify DNS panel

Migration steps when ready to go live:
- [ ] Sign up at Cloudflare (free) → add `rawaviation.mt`
- [ ] Cloudflare scans and imports all existing DNS records automatically
- [ ] Update nameservers at NIC Malta — replace Netlify's `dns1-4.p03.nsone.net` with the two Cloudflare nameservers
- [ ] In Cloudflare DNS: point `rawaviation.mt` / `www` to Railway production (A or CNAME)
- [ ] Verify all email MX/TXT/SPF/DKIM/DMARC records carried over correctly
- [ ] Verify Railway app is live on custom domain
- [ ] Cancel / remove Netlify (no longer needed)

## Email setup — rawaviation.mt (Namecheap Private Email)

**Status:** Active. DNS records live on Netlify. DKIM added after first mailbox creation.

### DNS records added to Netlify
| Type | Name | Value |
|------|------|-------|
| MX | `@` | `mx1.privateemail.com` (priority 10) |
| MX | `@` | `mx2.privateemail.com` (priority 10) |
| TXT | `@` | `v=spf1 include:spf.privateemail.com ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:postmaster@rawaviation.mt` |
| TXT | `default._domainkey` | `v=DKIM1;k=rsa;p=...` (generated in Namecheap after mailbox creation) |

### Adding a new team member
1. Log into Namecheap Private Email → Create Mailbox → `name@rawaviation.mt`
2. Create their Strapi admin user with the same email (Settings → Administration Panel → Users)
3. Create their Author Profile in Strapi Content Manager

### Connect a mailbox to Gmail (send & receive)
**Receive** (POP3):
- Gmail → Settings → Accounts and Import → Check mail from other accounts
- POP Server: `mail.privateemail.com` | Port: `995` | SSL: on
- Username: full email address, Password: mailbox password

**Send as** (SMTP):
- Gmail → Settings → Accounts and Import → Send mail as
- SMTP Server: `mail.privateemail.com` | Port: `587` | TLS: on
- Username: full email address, Password: mailbox password
- Gmail sends verification code to the mailbox → retrieve from privateemail.com webmail

### Verify email health
- [mail-tester.com](https://mail-tester.com) — send a test email, check SPF/DKIM/DMARC pass (aim for 10/10)
- Gmail → Show original → look for `dkim=pass` and `spf=pass`

## Reference docs

| Doc | Purpose |
|-----|---------|
| [docs/STAGING.md](./docs/STAGING.md) | Staging deploy guide + current status + troubleshooting |
| [docs/PRODUCTION.md](./docs/PRODUCTION.md) | Production deploy guide |
| [docs/REFERENCE.md](./docs/REFERENCE.md) | Env vars, topology, author schema, code patterns, security |
| [CLAUDE.md](./CLAUDE.md) | Repo map and dev notes for contributors / AI |
