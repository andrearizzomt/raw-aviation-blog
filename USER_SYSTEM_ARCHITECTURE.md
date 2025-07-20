# 👥 User System Architecture

## 🎯 **Overview**

This document defines the Enhanced User Categorization System for the Aviation Blog, providing a unified approach to user management, authorship attribution, and public author profiles.

## 📊 **User Model Schema**

### **Extended User Fields**
```json
{
  // Strapi Built-in Fields
  "username": "string (required)",
  "email": "string (required)",
  "role": "relation to Role (required)",
  
  // Enhanced Author Fields
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

### **Updated Content Schemas**

#### **Articles Schema (Modified)**
```json
{
  "Title": "string (required)",
  "Slug": "uid (required, targetField: Title)", 
  "Content": "blocks (required)",
  "Date": "date (required)",
  "authors": "relation to User (multiple, required)",
  "Featured_Image": "media (required)"
}
```

#### **Reports Schema (Modified)**
```json
{
  "Title": "string (required)",
  "Date": "date (required)", 
  "Content": "blocks (required)",
  "authors": "relation to User (multiple, required)",
  "Main_Image": "media (required)",
  "Images": "media (multiple)"
}
```

#### **Galleries Schema (Modified)**
```json
{
  "Title": "string (required)",
  "Slug": "uid (required, targetField: Title)",
  "Event_Date": "date (required)",
  "Description": "text (required)",
  "authors": "relation to User (multiple, required)",
  "Images": "media (multiple, required)"
}
```

### **Database Relations**
```
User ←→ Articles (many-to-many)
User ←→ Reports (many-to-many)
User ←→ Galleries (many-to-many)
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

### **TypeScript Types**
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

interface ContentWithAuthors {
  id: number;
  title: string;
  slug: string;
  authors: User[];
  // ... other content fields
}
```

### **API Fetchers**
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

### **Component Structure**
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

---

**Version**: 1.0  
**Last Updated**: Current implementation planning  
**Dependencies**: Strapi 5.16.1, Next.js 15.3.4  
**Related Documents**: `TO_DO_LIST.md`, `STARTUP_GUIDE.md` 