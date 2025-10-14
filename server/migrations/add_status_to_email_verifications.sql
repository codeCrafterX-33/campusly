-- Migration: Add status column to email_verifications table
-- This tracks whether an email has been successfully verified

-- Add the status column with default value 'pending'
ALTER TABLE email_verifications 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add a check constraint to ensure status is one of the valid values
ALTER TABLE email_verifications 
ADD CONSTRAINT check_status_values 
CHECK (status IN ('pending', 'verified', 'expired'));

-- Add comment for documentation
COMMENT ON COLUMN email_verifications.status IS 'Status of email verification: pending, verified, or expired';

-- Rollback (if needed)
-- To rollback this migration:
-- ALTER TABLE email_verifications DROP CONSTRAINT IF EXISTS check_status_values;
-- ALTER TABLE email_verifications DROP COLUMN IF EXISTS status;
