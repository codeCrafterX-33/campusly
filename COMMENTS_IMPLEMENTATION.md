# 📝 Comments System Implementation Documentation

## 🎯 **Project Overview**

This document tracks the step-by-step implementation of a Twitter-like comments system for the Campusly app, featuring 2-level threading (main posts → comments → replies).

---

## 🗄️ **Phase 1: Database Schema Design**

### **Decision: Single Table Approach**

We chose to use the existing `posts` table with additional columns rather than creating separate tables. This approach:

- ✅ Reuses existing structure
- ✅ Supports media in comments
- ✅ Simplifies queries
- ✅ Maintains consistency

### **Database Migration Applied** ✅

**File**: `server/migrations/add_comments_threading.sql`

```sql
-- Added 4 new columns to posts table
ALTER TABLE posts ADD COLUMN parent_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN comment_depth INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN like_count INTEGER DEFAULT 0;

-- Added constraints for data integrity
ALTER TABLE posts ADD CONSTRAINT check_comment_depth CHECK (comment_depth >= 0 AND comment_depth <= 2);
ALTER TABLE posts ADD CONSTRAINT check_no_self_reference CHECK (id != parent_post_id);

-- Added indexes for performance
CREATE INDEX idx_posts_parent_id ON posts(parent_post_id);
CREATE INDEX idx_posts_comment_depth ON posts(comment_depth);
CREATE INDEX idx_posts_createdon_desc ON posts(createdon DESC);
```

### **Threading Structure**

- **Level 0**: Main posts (`parent_post_id = NULL`, `comment_depth = 0`)
- **Level 1**: Direct comments (`parent_post_id = main_post_id`, `comment_depth = 1`)
- **Level 2**: Replies to comments (`parent_post_id = comment_id`, `comment_depth = 2`)

---

## 🔧 **Phase 2: Backend API Implementation**

### **Comment Controller Created** ✅

**File**: `server/controllers/commentController.js`

#### **Endpoints Implemented:**

1. **POST** `/api/comments` - Create comment
2. **GET** `/api/comments/:postId` - Get comments for a post
3. **PUT** `/api/comments/:commentId` - Update comment
4. **DELETE** `/api/comments/:commentId` - Delete comment
5. **POST** `/api/comments/:commentId/like` - Like/unlike comment

#### **Key Features:**

- ✅ 2-level threading enforcement
- ✅ PostgreSQL optimized queries
- ✅ User ownership validation
- ✅ Comment count updates
- ✅ Soft delete support

### **Comment Routes Created** ✅

**File**: `server/routes/commentRoutes.js`

```javascript
import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/", createComment);
router.get("/:postId", getComments);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);
router.post("/:commentId/like", toggleCommentLike);

export default router;
```

---

## 🎨 **Phase 3: Frontend Implementation** (In Progress)

### **Components to Create:**

- [x] **CommentCard** - Individual comment display
- [x] **CommentsList** - Container with pagination
- [x] **CommentContext** - State management
- [x] **Update PostScreen** - Show comments

### **Current Frontend Status:**

- ✅ **CommentScreen** - Updated to use new comment API
- ✅ **PostCard** - Updated with clickable prop
- ✅ **PostScreen** - Updated to show CommentsList
- ✅ **Comments Display** - Fully implemented with threading

---

## 📊 **Phase 4: Data Flow Architecture**

### **Comment Creation Flow:**

```
User types comment → CommentScreen → API → Database
                                    ↓
PostScreen updates ← CommentContext ← API Response
```

### **Comment Display Flow:**

```
PostScreen → CommentsList → CommentCard (for each comment)
                ↓
            API call to get comments
                ↓
            Display with threading
```

---

## 🔄 **Phase 5: Integration Points**

### **Updated CommentScreen** (Completed)

**File**: `app/screens/CommentScreen.tsx`

- ✅ Media upload support
- ✅ User input handling
- ✅ Updated API endpoint to use new comment API

### **Updated PostScreen** (Completed)

**File**: `app/screens/PostScreen.tsx`

- ✅ Unclickable PostCard
- ✅ Added CommentsList component

### **Updated PostCard** (Completed)

**File**: `app/components/Post/PostCard.tsx`

- ✅ Added `clickable` prop
- ✅ Navigation to CommentScreen

---

## 🚀 **Phase 6: Next Implementation Steps**

### **Immediate Tasks:**

1. **Create CommentCard Component**

   - Display comment content, user info, timestamp
   - Show like count and reply button
   - Handle media display

2. **Create CommentsList Component**

   - Fetch comments from API
   - Implement pagination
   - Handle loading states

3. **Create CommentContext**

   - Global comment state management
   - API integration functions
   - Real-time updates

4. **Update CommentScreen**

   - Use new comment API endpoint
   - Handle threading (replies to comments)

5. **Update PostScreen**
   - Replace placeholder with CommentsList
   - Add pull-to-refresh

### **Future Enhancements:**

- [ ] Real-time comment updates
- [ ] Comment moderation
- [ ] Comment analytics
- [ ] Advanced threading (if needed)

---

## 📋 **API Endpoints Reference**

### **Create Comment**

```javascript
POST /api/comments
{
  "postId": 123,
  "content": "Great post!",
  "media": [{"url": "...", "type": "image"}],
  "user_id": 456,
  "createdby": "user@email.com",
  "parentCommentId": null // For replies
}
```

### **Get Comments**

```javascript
GET /api/comments/123?page=1&limit=20&includeReplies=true
```

### **Update Comment**

```javascript
PUT /api/comments/789
{
  "content": "Updated comment",
  "user_id": 456
}
```

### **Delete Comment**

```javascript
DELETE /api/comments/789
{
  "user_id": 456
}
```

### **Like Comment**

```javascript
POST /api/comments/789/like
{
  "user_id": 456
}
```

---

## 🎯 **Design Decisions Made**

### **Why Single Table?**

- Reuses existing post structure
- Supports media in comments
- Simpler queries and joins
- Consistent data model

### **Why 2-Level Threading?**

- Twitter-like user experience
- Prevents UI clutter
- Better performance
- Industry standard

### **Why Stored Depth Column?**

- Fast query performance
- Simple UI logic
- Mobile app optimization
- Easy to implement

---

## 🔧 **Technical Specifications**

### **Database Schema:**

```sql
posts (
  id INTEGER PRIMARY KEY,
  content TEXT,
  media JSONB,
  user_id INTEGER,
  createdon TIMESTAMP,
  createdby TEXT,
  club INTEGER,
  -- New comment fields
  parent_post_id INTEGER REFERENCES posts(id),
  comment_depth INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
)
```

### **Threading Rules:**

- Main posts: `parent_post_id = NULL`, `comment_depth = 0`
- Comments: `parent_post_id = main_post_id`, `comment_depth = 1`
- Replies: `parent_post_id = comment_id`, `comment_depth = 2`
- Maximum depth: 2 levels (enforced by constraint)

---

## 📝 **Update Log**

### **2024-01-XX - Initial Implementation**

- ✅ Database migration created
- ✅ Backend API controller implemented
- ✅ Comment routes created
- ✅ Documentation started

### **2024-01-XX - Frontend Implementation Complete**

- ✅ CommentCard component created
- ✅ CommentsList component created
- ✅ CommentContext for state management
- ✅ PostScreen updated with CommentsList
- ✅ CommentScreen updated to use new API
- ✅ Server routes integrated

### **Next Update**

- [ ] API integration testing
- [ ] UI/UX refinement
- [ ] Real-time updates implementation

---

## 🎯 **Success Metrics**

### **Performance Targets:**

- Comment load time: < 200ms
- Comment creation: < 500ms
- UI responsiveness: 60fps

### **User Experience Goals:**

- Twitter-like comment interface
- Smooth scrolling and interactions
- Intuitive reply system
- Media support in comments

---

_This document will be updated as we progress through the implementation phases._
