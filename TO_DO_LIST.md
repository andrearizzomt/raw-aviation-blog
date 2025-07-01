# 📝 Aviation Blog Project To-Do List

## 1. Project Setup
- [x] Create a new directory for the project.
- [x] Initialize two subfolders: `/frontend` (Next.js) and `/cms` (Strapi).

---

## 2. Strapi CMS Setup
- [x] Bootstrap Strapi in `/cms` (`npx create-strapi-app@latest cms`).
- [ ] Configure database:
  - [x] Use SQLite for local development.
  - [ ] Prepare PostgreSQL config for production.
- [x] Create content types:
  - [x] `Article` (title, slug, content, date, author, featured image)
  - [x] `Report` (title, date, PDF, summary)
  - [x] `Gallery` (title, event date, description, images)
- [x] Set up Strapi roles & permissions:
  - [x] Allow unauthenticated (public) access to `find` and `findOne` for all content types.
  - [x] Allow public access to media files.
- [ ] (Optional) Install image optimization plugins for Strapi.

---

## 3. Next.js Frontend Setup
- [x] Bootstrap Next.js app in `/frontend` (`npx create-next-app@latest frontend -ts`).
- [x] Install dependencies:
  - [x] Tailwind CSS, PostCSS, Autoprefixer
  - [x] Zod
- [x] Configure Tailwind CSS.
- [x] Set up environment variables for Strapi API URL.

---

## 4. Frontend Development
- [x] Set up project structure (folders for articles, galleries, reports).
- [x] Create API fetchers for Strapi content (REST or GraphQL).
- [x] Define TypeScript types for each content type.
- [x] Create Zod schemas for API validation.
- [ ] Integrate Zod validation with API fetchers.
- [ ] Build list pages:
  - [ ] `/articles`
  - [ ] `/galleries`
  - [ ] `/reports`
- [ ] Build dynamic detail pages:
  - [ ] `/articles/[slug]`
  - [ ] `/galleries/[id]`
  - [ ] `/reports/[id]`
- [ ] Add dynamic `<title>` and `<meta>` tags for SEO.
- [ ] Implement responsive, clean UI with Tailwind CSS.
- [ ] Render images from Strapi with proper optimization and alt tags.

---

## 5. Testing & Validation
- [ ] Test fetching and rendering of all content types.
- [ ] Validate API responses with Zod.
- [ ] Check SEO tags and page metadata.
- [ ] Test image loading and optimization.

---

## 6. Deployment
- [ ] Prepare Strapi for production (PostgreSQL, environment variables).
- [ ] Prepare Next.js for production (build, environment variables).
- [ ] Deploy both apps to your VPS.
- [ ] Set up reverse proxy (e.g., Nginx) if needed.
- [ ] Secure both apps (HTTPS, CORS, etc.).

---

## 7. (Optional Enhancements)
- [ ] Add search functionality.
- [ ] Add pagination to list pages.
- [ ] Add sitemap and robots.txt for SEO.
- [ ] Add analytics (e.g., Plausible, Google Analytics).
- [ ] Add contact form or newsletter signup. 