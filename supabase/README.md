# Supabase Setup Guide

This directory contains the database schema and migrations for DBR V2.

## Quick Start

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization: **Cold Lava** (or create new)
4. Project name: **dashboardproject**
5. Database password: (save this securely!)
6. Region: **UK West (London)**
7. Pricing plan: **Free** (to start)

### 2. Get Project Credentials

After project creation, go to **Project Settings** → **API**:

- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

Save these to your `.env.local` file (see root directory).

### 3. Run Migration

#### Option A: Via SQL Editor (Recommended for first time)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste into the editor
6. Click **Run** (bottom right)
7. Wait for "Success. No rows returned" message

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 4. Create Storage Buckets

After running the migration, create storage buckets:

1. Go to **Storage** (left sidebar)
2. Click **New Bucket**
3. Create three buckets:
   - **csv_uploads** (private)
   - **client_logos** (public)
   - **exports** (private)

### 5. Verify Setup

Run this query in SQL Editor to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 13 tables:
- campaign_settings
- clients
- conversations
- datasets
- leads
- lessons
- messages
- prompt_templates
- prompt_versions
- prompts
- sophie_insights
- uploads
- users

### 6. Test RLS Policies

Verify Row Level Security is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

## Database Schema

See `/docs/DBR_V2_DATABASE_SCHEMA.md` for complete schema documentation.

### Table Overview

| Table | Purpose | Records (est.) |
|-------|---------|----------------|
| clients | Organizations using platform | 100-1000 |
| users | Dashboard users | 200-5000 |
| datasets | Lead batches/campaigns | 500-10,000 |
| campaign_settings | Campaign configurations | 200-5000 |
| leads | Individual contacts | 100,000-10M |
| conversations | Message threads | 50,000-5M |
| messages | Individual SMS | 200,000-20M |
| lessons | Sophie's learning | 100-5000 |
| prompts | AI agent prompts | 200-5000 |
| prompt_templates | Template library | 5-50 |
| prompt_versions | Version history | 500-10,000 |
| sophie_insights | AI analysis results | 10,000-1M |
| uploads | File upload tracking | 1000-50,000 |

## Seed Data (Coming Soon)

To add test data for development:

```bash
supabase db seed
```

Seed scripts will be added to `supabase/seed.sql`.

## Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### Error: "relation does not exist"

- You need to run the migration first
- Check you're connected to the right database

### Error: "permission denied for table"

- RLS policies are blocking access
- For development, you can temporarily disable RLS:
  ```sql
  ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;
  ```
- Don't forget to re-enable before production!

### Migration fails midway

- Drop all tables and start fresh:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```
- Then run the migration again

## Next Steps

After database setup:

1. ✅ Database schema created
2. Configure Supabase client in Next.js
3. Create API routes for CRUD operations
4. Build dashboard UI components
5. Test with sample data

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
