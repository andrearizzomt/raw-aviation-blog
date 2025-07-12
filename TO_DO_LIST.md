# 📝 Aviation Blog Project To-Do List

## ✅ Current Status (as of latest commit)
- Strapi CMS is running with all content types (Article, Report, Gallery) and public API access.
- Next.js frontend is running and connected to Strapi.
- **New aviation blog homepage** with hero section and latest content showcase.
- **Navigation component** added to layout for easy site navigation.
- Articles list page (`/articles`) is fully functional with pagination and image rendering.
- **Galleries list page (`/galleries`) is fully functional with pagination and image rendering.**
- **Reports list page (`/reports`) is fully functional with pagination and image rendering.**
- **All dynamic detail pages are implemented: `/articles/[slug]`, `/galleries/[id]`, `/reports/[slug]`**
- Test page (`/test`) confirms API integration and content fetching for all types.
- TypeScript types and Zod validation are fully integrated.
- Content is being served and displayed from Strapi to the frontend.
- **Environment variables standardized** to use `NEXT_PUBLIC_STRAPI_URL` throughout.

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
  - [x] `Report` (title, date, content rich text, main image, images)
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
- [x] **Standardize environment variable naming** (`NEXT_PUBLIC_STRAPI_URL`).

---

## 4. Frontend Development
- [x] Set up project structure (folders for articles, galleries, reports).
- [x] Create API fetchers for Strapi content (REST or GraphQL).
- [x] Define TypeScript types for each content type.
- [x] Create Zod schemas for API validation.
- [x] Integrate Zod validation with API fetchers.
- [x] Create test page to verify API integration.
- [x] Build list pages:
  - [x] `/articles`
  - [x] `/galleries`
  - [x] `/reports`
- [x] Build dynamic detail pages:
  - [x] `/articles/[slug]`
  - [x] `/galleries/[id]`
  - [x] `/reports/[slug]`
- [x] **Create aviation blog homepage** with hero section and content showcase.
- [x] **Add navigation component** to layout.
- [x] **Update metadata** for aviation blog branding.
- [x] **Implement minimalist theme system**:
  - [x] Light and dark themes using CSS variables
  - [x] Theme toggle component with hover effects
  - [x] Theme persistence in localStorage
  - [x] No flash on page load
  - [x] Consistent theme across all components
- [ ] Add dynamic `<title>` and `<meta>` tags for SEO.
- [x] Implement responsive, clean UI with Tailwind CSS.
- [x] Render images with proper optimization and alt tags.

---

## 5. Testing & Validation
- [x] Test fetching and rendering of all content types.
- [x] Validate API responses with Zod.
- [ ] Check SEO tags and page metadata.
- [x] Test image loading and optimization.
- [x] **Test homepage functionality** and content display.

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
- [x] Add pagination to list pages.
- [ ] Add sitemap and robots.txt for SEO.
- [ ] Add analytics (e.g., Plausible, Google Analytics).
- [ ] Add contact form or newsletter signup.
- [ ] **Add rich text rendering** for report content blocks.
- [ ] **Add image galleries** with lightbox functionality.
- [ ] **Add social sharing** buttons for articles and reports. 