-- Migration: Add intro fields to users table
-- Run this SQL to add the new intro fields

-- Add new columns for intro section
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(30),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(30),
ADD COLUMN IF NOT EXISTS headline VARCHAR(100),
ADD COLUMN IF NOT EXISTS location VARCHAR(50),
ADD COLUMN IF NOT EXISTS graduation_year VARCHAR(4),
ADD COLUMN IF NOT EXISTS education_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS education_entries JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.headline IS 'User professional headline or title';
COMMENT ON COLUMN users.location IS 'User location or city';
COMMENT ON COLUMN users.graduation_year IS 'User expected or actual graduation year';
COMMENT ON COLUMN users.education_level IS 'User education level (high_school, bachelor, master, etc.)';
COMMENT ON COLUMN users.education_entries IS 'Array of education entries with institution, degree, and year';
COMMENT ON COLUMN users.updated_at IS 'Timestamp of last update to user record';

-- Rollback (if needed)
-- To rollback this migration:

-- ALTER TABLE users 
-- DROP COLUMN first_name,
-- DROP COLUMN last_name,
-- DROP COLUMN headline,
-- DROP COLUMN location,
-- DROP COLUMN graduation_year,
-- DROP COLUMN education_level,
-- DROP COLUMN education_entries,
-- DROP COLUMN updated_at;

-- DROP TRIGGER IF EXISTS update_users_updated_at ON users;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
