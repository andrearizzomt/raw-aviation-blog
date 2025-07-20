# 👥 User System Architecture

## 🎯 **Overview**

This document defines the Enhanced User Categorization System for the Aviation Blog, providing a unified approach to user management, authorship attribution, and public author profiles.

## 📊 **Current Implementation Status**

### ✅ **COMPLETED Phase 1: Author System Foundation**
- **✅ Author Profile Content Type Created** - Separate from User model to avoid schema conflicts
- **✅ Multi-Author Relations Implemented** - Articles, Reports, Galleries support multiple authors
- **✅ Frontend Author Display System** - AuthorDisplay component with proper TypeScript types
- **✅ UI Integration Complete** - All list and detail pages show authors with inline layout
- **✅ Homepage Integration** - Latest content sections include author attribution  
- **✅ Date Format Standardization** - Consistent "July 8, 2025" format throughout
- **✅ Type Safety Achieved** - Proper StrapiAuthorProfile types, no `any[]` usage
- **✅ API Population Working** - Author data properly fetched and displayed

### 🔄 **CURRENT STATUS: Testing & Content Creation Phase**
- **🟡 Author Profiles Created** - William Spiteri (founder) profile exists and working
- **🟡 Content Attribution** - "First Test Flight Review" article properly shows William Spiteri
- **🟡 System Validation** - Frontend displaying "Unknown Author" for unassigned content (expected)

### 📋 **PENDING Phase 2: User System Integration**
- **❌ User Model Extension** - Extend built-in User model for author features
- **❌ About Page Implementation** - Public author showcase page
- **❌ Content Migration** - Link existing content to author profiles
- **❌ Permission System Setup** - Role-based access for different author types
- **❌ Public API Configuration** - Enable public access to author data

## 📊 **Current Architecture: Author Profile Content Type**

### **✅ IMPLEMENTED: Author Profile Schema**
```json
{
  "id": "number (auto-generated)",
  "documentId": "string (auto-generated)",
  "displayName": "string (required)",
  "bio": "rich text or string (flexible)",
  "profilePhoto": "media (optional)",
  "position": "string (required)",
  "isPublicAuthor": "boolean (required, default: false)",
  "authorType": "enumeration (required, values: founder|external_contributor|guest)",
  "authorSlug": "uid (required, targetField: displayName)",
  "showContributionCount": "boolean (required, default: false)",
  "socialLinks": "JSON (optional, instagram/facebook)",
  "user": "relation to User (optional)",
  "createdAt": "datetime (auto)",
  "updatedAt": "datetime (auto)",
  "publishedAt": "datetime (auto)"
}
```

### **🔮 FUTURE: Extended User Fields** *(Phase 2)*
```json
{
  // Strapi Built-in Fields
  "username": "string (required)",
  "email": "string (required)",
  "role": "relation to Role (required)",
  
  // Enhanced Author Fields (Future Integration)
  "displayName": "string (required)",
  "bio": "rich text (required)",
  "profilePhoto": "media (required)",
  "position": "string (required)",
  "isPublicAuthor": "boolean (required, default: false)",
  "authorType": "enumeration (required, default: guest)",
  "authorSlug": "uid (required, targetField: displayName)",
  "showContributionCount": "boolean (required, default: false)",
  "socialLinks": "JSON (optional)"
}
```

### **Author Type Enumeration**
```json
{
  "values": [
    "founder",
    "external_contributor", 
    "guest"
  ],
  "default": "guest"
}
```

### **Social Links JSON Structure**
```json
{
  "instagram": "https://instagram.com/username",
  "facebook": "https://facebook.com/username"
}
```

## 🏷️ **Author Categories**

### **Founder**
- **Role**: Core team members and founding members
- **Display**: Featured prominently in "Who We Are" section
- **Characteristics**: 
  - Larger profile cards
  - Detailed biographies
  - Social links prominent
  - Optional contribution count display

### **External Contributor**
- **Role**: Regular external contributors and industry experts
- **Display**: Featured in "Contributors & Guests" section
- **Characteristics**:
  - Standard profile cards
  - Medium-length biographies
  - Optional contribution count (usually enabled)

### **Guest**
- **Role**: One-time contributors, guest writers, photographers
- **Display**: Listed in "Contributors & Guests" section
- **Characteristics**:
  - Standard profile cards
  - Brief biographies
  - Optional contribution count (admin choice)

## 🔄 **Author Type Progression**

### **Natural Progression Path**
```
Guest → External Contributor → Founder
  ↓           ↓                  ↓
One-time → Regular contributor → Core team member
```

### **Migration Rules**
- Contribution counts carry over during transitions
- Public visibility (`isPublicAuthor`) maintained during transitions
- Content relations preserved across type changes
- Admin can promote/demote users between types

## 🗃️ **Content Type Relations**

### **✅ IMPLEMENTED: Content Schemas with Author Relations**

#### **Articles Schema (Current)**
```json
{
  "id": "number (auto-generated)",
  "documentId": "string (auto-generated)",
  "Title": "string (required)",
  "Slug": "uid (required, targetField: Title)", 
  "Content": "blocks (required)",
  "Date": "date (required)",
  "authors": "relation to Author-Profile (multiple)",
  "Featured_Image": "media (required)",
  "createdAt": "datetime (auto)",
  "updatedAt": "datetime (auto)",
  "publishedAt": "datetime (auto)"
}
```

#### **Reports Schema (Current)**
```json
{
  "id": "number (auto-generated)",
  "documentId": "string (auto-generated)",
  "Title": "string (required)",
  "Slug": "uid (required, targetField: Title)",
  "Date": "date (required)", 
  "Content": "blocks (required)",
  "authors": "relation to Author-Profile (multiple)",
  "Main_Image": "media (required)",
  "Images": "media (multiple)",
  "createdAt": "datetime (auto)",
  "updatedAt": "datetime (auto)",
  "publishedAt": "datetime (auto)"
}
```

#### **Galleries Schema (Current)**
```json
{
  "id": "number (auto-generated)",
  "documentId": "string (auto-generated)",
  "Title": "string (required)",
  "slug": "uid (required, targetField: Title)",
  "Date": "date (required)",
  "Description": "text (required)",
  "authors": "relation to Author-Profile (multiple)",
  "Images": "media (multiple, required)",
  "createdAt": "datetime (auto)",
  "updatedAt": "datetime (auto)",
  "publishedAt": "datetime (auto)"
}
```

### **✅ CURRENT: Database Relations**
```
Author-Profile ←→ Articles (many-to-many) ✅ WORKING
Author-Profile ←→ Reports (many-to-many) ✅ WORKING  
Author-Profile ←→ Galleries (many-to-many) ✅ WORKING
Author-Profile → User (many-to-one, optional) ✅ READY
User → Role (many-to-one, Strapi built-in) ✅ READY
```

### **🔮 FUTURE: Enhanced Relations** *(Phase 2)*
```
User ←→ Articles (many-to-many via Author-Profile)
User ←→ Reports (many-to-many via Author-Profile)
User ←→ Galleries (many-to-many via Author-Profile)
User → Role (many-to-one, Strapi built-in)
```

## 🎨 **About Page Architecture**

### **Page Structure**
```
/about
├── Hero Section
│   └── Blog mission and overview
├── "Who We Are" Section
│   └── Founders (authorType: "founder", isPublicAuthor: true)
└── "Contributors & Guests" Section
    ├── External Contributors (authorType: "external_contributor", isPublicAuthor: true)
    └── Guest Contributors (authorType: "guest", isPublicAuthor: true)
```

### **Visual Layout**
```
┌─────────────────────────────────────┐
│  🚁 Hero Section                   │
│  Aviation Blog Mission             │
├─────────────────────────────────────┤
│  👥 WHO WE ARE                     │
│  ┌───┐ ┌───┐ ┌───┐                 │
│  │ F │ │ F │ │ F │  Founders       │
│  └───┘ └───┘ └───┘                 │
├─────────────────────────────────────┤
│  🤝 CONTRIBUTORS & GUESTS          │
│  ┌──┐ ┌──┐ ┌──┐                    │
│  │EC│ │EC│ │EC│  External Contributors │
│  └──┘ └──┘ └──┘                    │
│  ┌─┐ ┌─┐ ┌─┐ ┌─┐                   │
│  │G│ │G│ │G│ │G│  Guest Contributors │
│  └─┘ └─┘ └─┘ └─┘                   │
└─────────────────────────────────────┘
```

### **Query Logic**
```javascript
// About Page Data Fetching
const founders = await User.find({
  isPublicAuthor: true,
  authorType: 'founder'
});

const externalContributors = await User.find({
  isPublicAuthor: true,
  authorType: 'external_contributor'
});

const guests = await User.find({
  isPublicAuthor: true,
  authorType: 'guest'
});
```

## 📈 **Contribution Tracking**

### **Automatic Counting**
```javascript
const getUserStats = async (userId) => {
  return {
    articles: await Article.countDocuments({ authors: userId }),
    reports: await Report.countDocuments({ authors: userId }),
    galleries: await Gallery.countDocuments({ authors: userId })
  };
};
```

### **Display Control**
- **showContributionCount**: Boolean field controlling visibility
- **Display Format**: "23 Articles • 5 Reports • 12 Galleries"
- **Admin Control**: Can toggle per user independently

### **Display Guidelines**
- **Founders**: Usually `showContributionCount: false` (focus on role/expertise)
- **External Contributors**: Usually `showContributionCount: true` (show expertise/activity)
- **Guests**: Admin choice (highlight prolific contributors, keep others minimal)

## 🔐 **Permission System**

### **Strapi Roles**
```
Super Admin (built-in)
├── Full system access
├── User management
├── Content management (all)
└── Author type promotion

Content Manager (custom)
├── CRUD all content types
├── Cannot manage users
└── Cannot change author types

Author (custom)
├── Create own content
├── Edit own content only
└── Cannot manage other users
```

### **Permission Matrix**
| Role | User Management | Own Content | All Content | Author Promotion | Public API |
|------|----------------|-------------|-------------|------------------|------------|
| **Super Admin** | ✅ Full | ✅ CRUD | ✅ CRUD | ✅ All Types | ✅ Read |
| **Content Manager** | ❌ None | ✅ CRUD | ✅ CRUD | ❌ No | ✅ Read |
| **Author** | ❌ None | ✅ CRUD | ❌ Read Only | ❌ No | ✅ Read |
| **Public** | ❌ None | ❌ None | ❌ None | ❌ No | ✅ Read |

### **API Permissions**
```
Public API Access:
├── Users (filtered: isPublicAuthor = true)
├── Articles (with populated authors)
├── Reports (with populated authors)
├── Galleries (with populated authors)
└── Media files (images)
```

## 💻 **Frontend Implementation**

### **✅ IMPLEMENTED: TypeScript Types**
```typescript
// Current Author Profile Interface
export interface StrapiAuthorProfile {
  id: number;
  documentId: string;
  displayName: string;
  bio?: ContentBlock[] | string;
  profilePhoto?: FeaturedImage;
  position: string;
  isPublicAuthor: boolean;
  authorType: 'founder' | 'external_contributor' | 'guest';
  authorSlug: string;
  showContributionCount: boolean;
  socialLinks?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// Content Interfaces with Authors
export interface StrapiArticle {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  Content: ContentBlock[];
  Date: string;
  authors: StrapiAuthorProfile[];
  Featured_Image: FeaturedImage;
  // ... other fields
}

export interface StrapiReport {
  id: number;
  documentId: string;
  Title: string;
  Slug: string;
  Date: string;
  Content: ContentBlock[];
  authors: StrapiAuthorProfile[];
  Main_Image: FeaturedImage;
  Images?: FeaturedImage[];
  // ... other fields
}

export interface StrapiGallery {
  id: number;
  documentId: string;
  Title: string;
  slug: string;
  Date: string;
  Description: string;
  authors: StrapiAuthorProfile[];
  Images: FeaturedImage[];
  // ... other fields
}
```

### **🔮 FUTURE: Enhanced User Types** *(Phase 2)*
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  profilePhoto: Media;
  position: string;
  isPublicAuthor: boolean;
  authorType: 'founder' | 'external_contributor' | 'guest';
  authorSlug: string;
  showContributionCount: boolean;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
  };
}
```

### **✅ IMPLEMENTED: API Fetchers**
```typescript
// Current Content Fetchers with Authors
export const getArticles = async (page = 1, pageSize = 6) => {
  return await fetchFromStrapi('/articles', {
    pagination: { page, pageSize },
    sort: 'Date:desc',
    populate: '*'
  });
};

export const getArticleBySlug = async (slug: string) => {
  return await fetchFromStrapi('/articles', {
    filters: { Slug: { $eq: slug } },
    populate: '*'
  });
};

// Similar implementations for Reports and Galleries
export const getReports = async (page = 1, pageSize = 6) => { /* ... */ };
export const getGalleries = async (page = 1, pageSize = 6) => { /* ... */ };

// Author Profile Fetchers (Ready for Use)
export const getAuthorProfiles = async () => {
  return await fetchFromStrapi('/author-profiles', {
    populate: '*'
  });
};

export const getPublicAuthorProfiles = async () => {
  return await fetchFromStrapi('/author-profiles', {
    filters: { isPublicAuthor: true },
    populate: '*'
  });
};
```

### **🔮 FUTURE: Enhanced API Fetchers** *(Phase 2)*
```typescript
// Get public authors for About page
export const getPublicAuthors = async () => {
  const founders = await fetchFromStrapi('/users', {
    filters: { isPublicAuthor: true, authorType: 'founder' }
  });
  
  const contributors = await fetchFromStrapi('/users', {
    filters: { isPublicAuthor: true, authorType: 'external_contributor' }
  });
  
  const guests = await fetchFromStrapi('/users', {
    filters: { isPublicAuthor: true, authorType: 'guest' }
  });
  
  return { founders, contributors, guests };
};
```

### **✅ IMPLEMENTED: Component Structure**
```typescript
// Current Author Display Component
<AuthorDisplay 
  authors={article.authors} 
  showPhoto={true} 
  size="md" 
/>

// Used across all content pages:
// - /articles (list and detail pages)
// - /reports (list and detail pages)  
// - /galleries (list and detail pages)
// - / (homepage latest content sections)

// AuthorDisplay Component Features:
// ✅ Multiple authors support
// ✅ Photo display (optional)
// ✅ Inline layout with dates
// ✅ Size variants (sm, md, lg)
// ✅ Proper TypeScript typing
// ✅ Graceful fallback ("Unknown Author")
```

### **🔮 FUTURE: Enhanced Component Structure** *(Phase 2)*
```typescript
<AboutPage>
  <HeroSection />
  <WhoWeAreSection>
    <AuthorGrid users={founders} variant="large" />
  </WhoWeAreSection>
  <ContributorsSection>
    <AuthorGrid users={contributors} variant="standard" />
    <AuthorGrid users={guests} variant="standard" />
  </ContributorsSection>
</AboutPage>
```

## 🔄 **Migration Strategy**

### **Data Migration Steps**
1. **Backup Current Data**
   - Export existing articles with string authors
   - Backup database before schema changes

2. **Extend User Model**
   - Add new fields to User content type
   - Set appropriate defaults and requirements

3. **Create User Records**
   ```javascript
   // Create users from existing author strings
   const existingAuthors = await getUniqueAuthors();
   for (const authorName of existingAuthors) {
     await User.create({
       username: slugify(authorName),
       displayName: authorName,
       authorType: 'guest',
       isPublicAuthor: false,
       // ... other required fields
     });
   }
   ```

4. **Update Content Relations**
   ```javascript
   // Link articles to user records
   const articles = await Article.find();
   for (const article of articles) {
     const user = await User.findOne({ displayName: article.Author });
     if (user) {
       await Article.updateOne(
         { _id: article._id },
         { authors: [user._id] }
       );
     }
   }
   ```

5. **Verify Data Integrity**
   - Ensure all content has author relations
   - Test frontend display
   - Verify About page functionality

### **Rollback Plan**
- Keep original string author fields as backup
- Ability to revert to string-based authors if needed
- Database restoration from backup if critical issues

## 📋 **Admin Workflow**

### **User Creation**
1. Admin creates new User in Strapi
2. Sets `authorType` (founder/external_contributor/guest)
3. Sets `isPublicAuthor` (appears on About page)
4. Configures `showContributionCount` display
5. User becomes available in author dropdowns

### **Content Creation**
1. Admin creates Article/Report/Gallery
2. Selects multiple authors from searchable dropdown
3. Authors can be mix of any `authorType`
4. Frontend displays all authors with proper attribution
5. About page updates automatically for public authors

### **Author Promotion**
1. Admin edits user profile
2. Changes `authorType` (guest → external_contributor → founder)
3. All existing content relations preserved
4. Contribution counts carry over
5. About page reflects new categorization

## 🎯 **Use Case Examples**

### **Scenario 1: Founder Article**
```
Article: "Future of Aviation Technology"
Authors: [John Smith (Founder)]

Display:
- About Page: ✅ John in "Who We Are" section
- Article Page: "By John Smith" with founder profile card
```

### **Scenario 2: Collaborative Report**
```
Report: "RIAT 2024 Coverage"
Authors: [
  Sarah (Founder), 
  Mike (External Contributor), 
  Lisa (Guest)
]

Display:
- About Page: 
  ✅ Sarah in "Who We Are"
  ✅ Mike in "Contributors & Guests"
  ✅ Lisa in "Contributors & Guests"
- Report Page: "By Sarah Johnson, Mike Davis, and Lisa Chen"
```

### **Scenario 3: Guest Contribution**
```
Gallery: "Thunderbirds Airshow"
Authors: [External Photographer (Guest)]

Display:
- About Page: ✅ Photographer in "Contributors & Guests"
- Gallery Page: "By Alex Rodriguez" with guest profile card
```

## 🚀 **Benefits**

### **Content Management**
- ✅ **Unified System**: Single User model for admin, authorship, and public profiles
- ✅ **Scalable**: Easy to add new authors or change permissions
- ✅ **Flexible Attribution**: Any content can have multiple authors of mixed types
- ✅ **Data Integrity**: Proper relational data instead of strings

### **User Experience**
- ✅ **Professional Presentation**: Clear hierarchy and categorization
- ✅ **Author Progression**: Natural path from guest to core team
- ✅ **Contribution Recognition**: Optional display of author activity
- ✅ **SEO Benefits**: Rich author information and proper attribution

### **Administrative**
- ✅ **Native Integration**: Uses Strapi's built-in user management
- ✅ **Role-based Access**: Granular permissions per content type
- ✅ **Content Credibility**: Clear distinction between internal and external expertise
- ✅ **Future-proof**: Easy to extend with additional author types or features

## 🔮 **Future Enhancements**

### **Phase 3 Possibilities**
- Individual author profile pages (`/authors/[slug]`)
- Author-based content filtering and search
- Author statistics and analytics dashboard
- Multi-language author bios and content
- Author collaboration workflow features
- RSS feeds per author
- Author-based content recommendations

### **Technical Considerations**
- Implement caching for author queries
- Consider search indexing for author content
- Plan for author content archival
- Design author content migration tools
- Consider author content ownership transfers

## 🎯 **Current Implementation Summary**

### **✅ What's Working Right Now**
1. **Author Profile System** - Fully functional content type with all required fields
2. **Multi-Author Content** - Articles, Reports, Galleries support multiple authors
3. **Frontend Display** - AuthorDisplay component showing authors across all pages
4. **Type Safety** - Proper TypeScript interfaces, no `any[]` usage
5. **Date Standardization** - Consistent "July 8, 2025" format throughout
6. **API Integration** - Author data properly fetched and populated
7. **Content Attribution** - William Spiteri (founder) properly attributed to content

### **🚧 What's Next (Phase 2)**
1. **User Model Integration** - Link Author Profiles to Strapi Users
2. **About Page** - Public showcase of authors by category
3. **Permission System** - Role-based access for author management
4. **Content Migration** - Assign authors to existing content
5. **Public API Access** - Enable frontend to fetch author data

### **🏆 Architecture Benefits Achieved**
- ✅ **Separation of Concerns** - Author Profiles separate from User authentication
- ✅ **Type Safety** - Comprehensive TypeScript typing throughout
- ✅ **Scalability** - Multiple authors per content, flexible author types
- ✅ **UI Consistency** - Standardized author display across all pages
- ✅ **Data Integrity** - Proper relational data instead of string authors
- ✅ **Professional Presentation** - Clean, inline author attribution

---

**Version**: 2.0 - Phase 1 Complete  
**Last Updated**: January 2025 - Author System Foundation Implemented  
**Dependencies**: Strapi 5.16.1, Next.js 15.3.4  
**Related Documents**: `TO_DO_LIST.md`, `STARTUP_GUIDE.md` 