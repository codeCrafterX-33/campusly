-- Add comments threading support to posts table
-- This migration adds the necessary fields for Twitter-like 2-level threading
-- PostgreSQL specific syntax

-- Add threading fields
ALTER TABLE posts ADD COLUMN parent_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN comment_depth INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN like_count INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX idx_posts_parent_id ON posts(parent_post_id);
CREATE INDEX idx_posts_comment_depth ON posts(comment_depth);
CREATE INDEX idx_posts_createdon_desc ON posts(createdon DESC);

-- Update existing posts to have comment_count = 0
UPDATE posts SET comment_count = 0 WHERE comment_count IS NULL;
UPDATE posts SET like_count = 0 WHERE like_count IS NULL;

-- Add constraints to ensure data integrity
ALTER TABLE posts ADD CONSTRAINT check_comment_depth CHECK (comment_depth >= 0 AND comment_depth <= 2);
ALTER TABLE posts ADD CONSTRAINT check_no_self_reference CHECK (id != parent_post_id);

-- Add comment to document the migration
COMMENT ON COLUMN posts.parent_post_id IS 'References the parent post for comments (NULL for main posts)';
COMMENT ON COLUMN posts.comment_depth IS 'Depth of comment threading (0=main post, 1=comment, 2=reply to comment)';
COMMENT ON COLUMN posts.comment_count IS 'Number of direct comments on this post';
COMMENT ON COLUMN posts.like_count IS 'Number of likes on this post';
