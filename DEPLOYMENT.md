# 🚀 Deployment Checklist

## Environment Variables

### Frontend (Next.js)
- [ ] Update `NEXT_PUBLIC_STRAPI_API_URL` to production URL
- [ ] Update `NEXT_PUBLIC_STRAPI_URL` to production URL
- [ ] Update any hardcoded localhost URLs in test pages

### CMS (Strapi)
- [ ] Set up PostgreSQL database configuration
- [ ] Configure production admin credentials
- [ ] Set up proper CORS settings
- [ ] Configure production email settings (if needed)
- [ ] Update database host from 'localhost' in database.ts

## Configuration Files

### Next.js
- [ ] Update `next.config.ts` image domains:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https', // Change to https
      hostname: 'your-production-domain.com', // Update hostname
      port: '', // Remove port for production
      pathname: '/uploads/**',
    },
  ],
},
```

### Strapi
- [ ] Update database configuration for PostgreSQL
- [ ] Configure production middleware settings
- [ ] Set up proper file upload provider (local/S3/etc.)
- [ ] Review and update API rate limiting (defaultLimit: 25, maxLimit: 100)
- [ ] Configure production-appropriate CORS origins

## Security

- [ ] Set up SSL certificates
- [ ] Configure HTTPS
- [ ] Set up proper CORS headers
- [ ] Review and update API permissions
- [ ] Set up proper backup strategy
- [ ] Configure rate limiting
- [ ] Set up proper logging
- [ ] Review and remove any test/debug routes
- [ ] Implement proper authentication for API endpoints

## Infrastructure

- [ ] Set up VPS/hosting provider
- [ ] Configure domain names and DNS
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure PM2 or similar process manager
- [ ] Set up monitoring (uptime, performance, etc.)
- [ ] Configure automated backups
- [ ] Set up CDN for media files (recommended)

## Pre-launch Checklist

- [ ] Test all API endpoints with production URLs
- [ ] Verify image loading and optimization
- [ ] Check all environment variables are set
- [ ] Test pagination and dynamic routes
- [ ] Verify SEO meta tags
- [ ] Test responsive design
- [ ] Check loading states and error handling
- [ ] Verify database migrations
- [ ] Test content creation in Strapi
- [ ] Verify media uploads
- [ ] Run security scan
- [ ] Test API rate limiting
- [ ] Verify CORS settings

## Post-launch

- [ ] Set up analytics
- [ ] Configure error monitoring
- [ ] Set up performance monitoring
- [ ] Create backup verification process
- [ ] Document deployment process
- [ ] Set up alerting for critical issues
- [ ] Monitor API usage and adjust rate limits if needed
- [ ] Set up regular security audits 