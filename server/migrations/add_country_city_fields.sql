-- Migration: Add country and city fields to users table
-- Run this SQL to add the new country and city fields

-- Add new columns for country and city
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN users.country IS 'User country';
COMMENT ON COLUMN users.city IS 'User city';

-- Rollback (if needed)
-- To rollback this migration:
-- ALTER TABLE users DROP COLUMN country, DROP COLUMN city;
