# 🚀 RAW Aviation Startup Guide

## 📁 Project Structure
```
raw-aviation-blog/
├── cms/          # Strapi CMS application
├── frontend/     # Next.js frontend application
├── README.md
├── TO_DO_LIST.md
└── DEPLOYMENT.md
```

## 🎯 Application Status
- **Frontend (Next.js)**: ✅ Running on http://localhost:3000
- **CMS (Strapi)**: ⏳ Needs to be started

## 🛠️ Startup Commands

### 1. Start Strapi CMS
```bash
cd "/Users/andrearizzo/Desktop/Cursor AI /raw-aviation-blog/cms"
npm run develop
```
**Expected Output:**
- Strapi admin panel: http://localhost:1337/admin
- API endpoints: http://localhost:1337/api

### 2. Start Next.js Frontend
```bash
cd "/Users/andrearizzo/Desktop/Cursor AI /raw-aviation-blog/frontend"
npm run dev
```
**Expected Output:**
- Local: http://localhost:3000
- Network: http://192.168.1.179:3000
- Ready in ~831ms

## 🔧 Environment Configuration

### CMS (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=testKey1,testKey2,testKey3,testKey4
API_TOKEN_SALT=tobemodifiedinproduction
ADMIN_JWT_SECRET=tobemodifiedinproduction
TRANSFER_TOKEN_SALT=tobemodifiedinproduction
JWT_SECRET=tobemodifiedinproduction
ENCRYPTION_KEY=tobemodified
```

### Frontend (.env)
```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

## 📊 Current Status (from TO_DO_LIST.md)
- ✅ Strapi CMS is running with all content types (Article, Report, Gallery)
- ✅ Next.js frontend is running and connected to Strapi
- ✅ New RAW Aviation homepage with hero section and latest content showcase
- ✅ Unified Navigation Component handling both desktop and mobile
- ✅ All navigation links working properly on both desktop and mobile
- ✅ Fixed header navigation with proper z-index layering
- ✅ Enhanced navigation active states with animations
- ✅ Fixed hydration issues for navigation active states
- ✅ Enhanced theme toggle system with better visual design
- ✅ Successful build with no TypeScript or ESLint errors
- ✅ Articles, Galleries, and Reports list pages fully functional
- ✅ All dynamic detail pages implemented with slug-based routing
- ✅ TypeScript types and Zod validation fully integrated
- ✅ Content being served from Strapi to frontend
- ✅ Environment variables standardized

## 🎯 Next Priorities (Phase 2)
1. **About Page** - Create content type and frontend page
2. **Contact Page** - Create contact form and content type  
3. **User Team Members** - Extend User type for "Who We Are" section
4. **Production Deployment** - PostgreSQL setup and VPS deployment
5. **SEO Enhancements** - Dynamic meta tags and sitemap

## 🔍 Useful Commands

### Check if applications are running
```bash
# Check Strapi (port 1337)
lsof -i :1337

# Check Next.js (port 3000)
lsof -i :3000

# Check all processes
ps aux | grep -E "(strapi|next)" | grep -v grep
```

### Build commands
```bash
# Build CMS
cd cms && npm run build

# Build Frontend
cd frontend && npm run build
```

### Development commands
```bash
# CMS development
cd cms && npm run develop

# Frontend development
cd frontend && npm run dev

# Frontend with Turbopack (current setup)
cd frontend && npm run dev
```

## 📝 Notes
- Both applications need to be running simultaneously for full functionality
- Frontend depends on CMS API being available at http://localhost:1337
- Use absolute paths when navigating to avoid directory issues
- The frontend is currently running with Turbopack for faster development
- All content types (Article, Report, Gallery) are configured and functional 