-- Migration: Add verified_school_email column to users table
-- This prevents one school email from being used to verify multiple accounts

-- Add the verified_school_email column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verified_school_email VARCHAR(255);

-- Add a unique constraint to prevent duplicate school email verifications
-- This ensures each school email can only be used once for verification
ALTER TABLE users 
ADD CONSTRAINT unique_verified_school_email 
UNIQUE (verified_school_email);

-- Add comment for documentation
COMMENT ON COLUMN users.verified_school_email IS 'School email used for student verification - prevents duplicate verifications';

-- Rollback (if needed)
-- To rollback this migration:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_verified_school_email;
-- ALTER TABLE users DROP COLUMN IF EXISTS verified_school_email;
