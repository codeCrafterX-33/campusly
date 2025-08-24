-- Migration: Update headline column length from 100 to 200 characters
-- Run this SQL to increase the headline field capacity

-- Update the headline column to allow 200 characters
ALTER TABLE users 
ALTER COLUMN headline TYPE VARCHAR(200);

-- Add comment for documentation
COMMENT ON COLUMN users.headline IS 'User professional headline or title (max 200 characters)';

-- Rollback (if needed)
-- To rollback this migration:
-- ALTER TABLE users ALTER COLUMN headline TYPE VARCHAR(100);
