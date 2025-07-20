# RAW Aviation Project

## 🛠 Project Overview
The site will feature aviation-related content like articles, reports, and photo galleries (e.g., airshows, exercises, etc.). All content will be managed in Strapi and fetched into the frontend built with Next.js.

## 🎯 Requirements

1. **Latest Versions**
   - Next.js (App Router or Pages Router — whichever fits best for SEO and maintainability)
   - Tailwind CSS
   - Strapi (headless CMS)
   - TypeScript for the frontend
   - Zod for schema validation on API responses

2. **Self-hosting on a VPS**
   - Not using Vercel, so avoid Vercel-specific features like `next/image` unless configured for local optimization.

3. **Strapi CMS Content Types**
   - `Article`: title, slug, content (rich text), date, author, featured image.
   - `Report`: title, date, PDF file, summary.
   - `Gallery`: title, event date, description, list of images.

4. **Database**
   - Use PostgreSQL for production (SQLite for local dev is fine).

5. **Frontend Requirements**
   - Render list pages (e.g., `/articles`, `/galleries`) and dynamic detail pages (e.g., `/articles/[slug]`).
   - Fetch content from Strapi via **REST or GraphQL**.
   - Use `getStaticProps` or `getServerSideProps` (or their App Router equivalents) depending on best practice.
   - Add **TypeScript typings** and **Zod validation schemas** for content fetched from the API.
   - Add dynamic `<title>` and `<meta>` tags for SEO.

6. **Styling**
   - Use Tailwind CSS for a responsive, clean UI.

## ✅ Deliverables
- Recommended project structure (frontend and CMS).
- Example Strapi content-type definitions (via admin UI or programmatically).
- Example API queries from Next.js (REST or GraphQL).
- Example Zod schemas + integration with TypeScript types.
- Any required configuration for Strapi roles and permissions to allow unauthenticated content access.
- Image optimization strategy for a VPS setup (since `next/image`'s remote loader won't be available by default). 