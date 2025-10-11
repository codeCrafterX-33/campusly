-- Add rules column to clubs table
ALTER TABLE clubs ADD COLUMN rules TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN clubs.rules IS 'Club rules and guidelines for members';
