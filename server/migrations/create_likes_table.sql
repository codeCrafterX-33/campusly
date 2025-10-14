-- Migration: Create likes table for post liking functionality
-- This table tracks which users have liked which posts

-- Create the likes table
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a user can only like a post once
    UNIQUE(user_id, post_id),
    
    -- Foreign key constraints with cascade delete
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at);

-- Add comment for documentation
COMMENT ON TABLE likes IS 'Tracks user likes on posts with unique constraint to prevent duplicate likes';

-- Rollback (if needed)
-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_likes_created_at;
-- DROP INDEX IF EXISTS idx_likes_post_id;
-- DROP INDEX IF EXISTS idx_likes_user_id;
-- DROP TABLE IF EXISTS likes;
