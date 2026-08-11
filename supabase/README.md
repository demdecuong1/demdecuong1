# Supabase Database Setup

## Quick Setup (5 minutes)

### Step 1: Run Migrations in Supabase Studio

1. Go to your Supabase project: https://supabase.com/dashboard/project/tliujhhdxyxiotjkszsp/sql/new

2. Copy and paste the contents of **ALL THREE** migration files in order:
   - `migrations/20260811_001_initial_schema.sql`
   - `migrations/20260811_002_rls_policies.sql`
   - `migrations/20260811_003_seed_data.sql`

3. Click **Run** to execute

**OR** use the combined file: `migrations/combined.sql` (all three merged)

### Step 2: Create Test Users

Go to: Authentication → Users → Add User

Create these 3 users:

| Email | Password | Role |
|-------|----------|------|
| admin@evident.com | Password123! | Portal Admin |
| manager@evident.com | Password123! | Internal Manager |
| user@evident.com | Password123! | Internal User |

### Step 3: Link Users to Profiles

After creating each user in the Auth dashboard, **copy their User ID** from the table.

Then run this SQL for each user (replace `<USER_ID>` with actual ID):

```sql
-- Admin user
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<USER_ID_FROM_AUTH>', 'admin@evident.com', 'System Administrator', 'portal_admin');

-- Manager user
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<USER_ID_FROM_AUTH>', 'manager@evident.com', 'Internal Manager', 'internal_manager');

-- Regular user
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<USER_ID_FROM_AUTH>', 'user@evident.com', 'Internal User', 'internal_user');
```

### Step 4: Verify Setup

Run this query to check everything worked:

```sql
SELECT
  p.email,
  p.full_name,
  p.role,
  (SELECT COUNT(*) FROM cases) as total_cases,
  (SELECT COUNT(*) FROM regions) as total_regions,
  (SELECT COUNT(*) FROM service_trackers) as total_trackers,
  (SELECT COUNT(*) FROM field_definitions) as total_field_defs
FROM profiles p;
```

You should see:
- 3 profiles (admin, manager, user)
- 11 regions (EMEA countries)
- 11 service trackers
- ~25 field definitions
- 0 cases (we'll add sample data next)

---

## What Was Created

### Database Tables
- ✅ `profiles` - User profiles linked to Supabase Auth
- ✅ `regions` - 11 EMEA countries
- ✅ `service_trackers` - One per region (TwoService-France, etc.)
- ✅ `user_trackers` - Partner scope assignments
- ✅ `cases` - Main case entity with JSONB dynamic fields
- ✅ `field_definitions` - Metadata for dynamic fields
- ✅ `case_events` - Audit log (append-only)
- ✅ `case_views` - Per-user change awareness tracking
- ✅ `case_comments` - Collaboration thread
- ✅ `case_documents` - File storage references
- ✅ `notifications` - In-app notifications

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Partners can **only** see cases from their assigned tracker
- ✅ Internal users see all cases (scoped by region - to be refined)
- ✅ Portal admins see everything

### Seed Data
- ✅ 11 regions (France, Germany, Italy, Spain, Switzerland, UK, Austria, Czech Republic, Poland, Belgium, Luxembourg)
- ✅ 11 service trackers (TwoService-{Country})
- ✅ 25 field definitions for dynamic fields (customer, device, service, dates, additional sections)

---

## Next Steps

After setup is complete:
1. Import sample cases from the CSV (Phase 1 final task)
2. Build the data access layer in `lib/data/` (Phase 2)
3. Implement auth and role checks in `lib/auth/` (Phase 2)
