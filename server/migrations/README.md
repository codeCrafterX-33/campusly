# Database Migrations

This directory contains database migration scripts for the Campusly application.

## Running Migrations

### 1. Add Intro Fields Migration

To add the new intro fields (headline, location, graduation_year) to your users table:

```bash
# Connect to your PostgreSQL database
psql -h your_host -U your_username -d your_database

# Run the migration
\i migrations/add_intro_fields.sql
```

Or run it directly:

```bash
psql -h your_host -U your_username -d your_database -f migrations/add_intro_fields.sql
```

### 2. What This Migration Adds

- `first_name` - VARCHAR(30) for user's first name
- `last_name` - VARCHAR(30) for user's last name
- `headline` - VARCHAR(100) for user's professional headline
- `location` - VARCHAR(50) for user's location
- `graduation_year` - VARCHAR(4) for user's graduation year
- `education_level` - VARCHAR(20) for user's education level
- `education_entries` - JSONB array for storing detailed education entries
- `updated_at` - TIMESTAMP that automatically updates when records change

### 3. Verification

After running the migration, verify the new columns exist:

```sql
\d users
```

You should see the new columns in the table structure.

### 4. Rollback (if needed)

To rollback this migration:

```sql
ALTER TABLE users
DROP COLUMN headline,
DROP COLUMN location,
DROP COLUMN graduation_year,
DROP COLUMN updated_at;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Important Notes

- Always backup your database before running migrations
- Test migrations on a development database first
- The `IF NOT EXISTS` clause prevents errors if columns already exist
- The trigger automatically maintains the `updated_at` timestamp
