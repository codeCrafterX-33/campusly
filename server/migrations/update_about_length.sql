-- Migration: Update about field length to 1000 characters
-- Run this SQL to increase the about field character limit

-- Update the about column to allow up to 1000 characters
ALTER TABLE users
ALTER COLUMN about TYPE VARCHAR(1000);

-- Add comment for documentation
COMMENT ON COLUMN users.about IS 'User about/bio text (max 1000 characters)';

-- Rollback (if needed)
-- To rollback this migration:
-- ALTER TABLE users ALTER COLUMN about TYPE VARCHAR(500);
