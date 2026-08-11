# 🚀 Phase 1 Setup Guide - Database & Users

**Time required:** ~10 minutes

---

## Step 1: Run Database Migrations (3 minutes)

### Option A: One-Click (Recommended)

1. Open Supabase SQL Editor:
   - Go to: https://supabase.com/dashboard/project/tliujhhdxyxiotjkszsp/sql/new

2. Copy the entire contents of: `supabase/migrations/combined.sql`

3. Paste into the SQL Editor and click **Run**

4. You should see: ✅ Success. No rows returned

### Option B: Run Individual Files

Run these files in order (same SQL Editor):
1. `20260811_001_initial_schema.sql` - Creates tables
2. `20260811_002_rls_policies.sql` - Adds security policies
3. `20260811_003_seed_data.sql` - Adds regions, trackers, field definitions

---

## Step 2: Create Test Users (3 minutes)

Go to: **Authentication → Users → Add user**

Create these 3 users:

### User 1: Portal Admin
- **Email:** `admin@evident.com`
- **Password:** `Password123!`
- **Auto Confirm User:** ✅ (check this box)
- Click **Create user**
- **📋 Copy the User ID from the table** (e.g., `a1b2c3d4-...`)

### User 2: Internal Manager
- **Email:** `manager@evident.com`
- **Password:** `Password123!`
- **Auto Confirm User:** ✅
- Click **Create user**
- **📋 Copy the User ID**

### User 3: Internal User
- **Email:** `user@evident.com`
- **Password:** `Password123!`
- **Auto Confirm User:** ✅
- Click **Create user**
- **📋 Copy the User ID**

---

## Step 3: Link Users to Profiles (2 minutes)

Go back to: **SQL Editor → New Query**

Run this SQL **three times**, replacing `<USER_ID>` each time:

```sql
-- For admin@evident.com
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<PASTE_ADMIN_USER_ID_HERE>', 'admin@evident.com', 'System Administrator', 'portal_admin');

-- For manager@evident.com
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<PASTE_MANAGER_USER_ID_HERE>', 'manager@evident.com', 'Internal Manager', 'internal_manager');

-- For user@evident.com
INSERT INTO profiles (id, email, full_name, role)
VALUES ('<PASTE_USER_USER_ID_HERE>', 'user@evident.com', 'Internal User', 'internal_user');
```

Example:
```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@evident.com', 'System Administrator', 'portal_admin');
```

---

## Step 4: Import Sample Cases (1 minute)

Still in SQL Editor, run: `supabase/import-cases.sql`

This imports 20 sample cases from TwoService-France.

---

## Step 5: Verify Setup (1 minute)

Run this verification query:

```sql
SELECT
  'Profiles' as table_name,
  COUNT(*)::text as count
FROM profiles
UNION ALL
SELECT 'Regions', COUNT(*)::text FROM regions
UNION ALL
SELECT 'Service Trackers', COUNT(*)::text FROM service_trackers
UNION ALL
SELECT 'Field Definitions', COUNT(*)::text FROM field_definitions
UNION ALL
SELECT 'Cases', COUNT(*)::text FROM cases
ORDER BY table_name;
```

**Expected results:**
- Cases: **20**
- Field Definitions: **25**
- Profiles: **3**
- Regions: **11**
- Service Trackers: **11**

✅ If these numbers match, setup is complete!

---

## Step 6: Test Login

1. Stop the dev server (Ctrl+C in terminal)
2. Restart: `npm run dev`
3. Open: https://stunning-halibut-rp6vpxv6g5rcvw-3000.app.github.dev
4. Try logging in with:
   - **Email:** `admin@evident.com`
   - **Password:** `Password123!`

---

## What Was Created

### Database Structure
```
profiles (3 users)
  ├─ Portal Admin
  ├─ Internal Manager
  └─ Internal User

regions (11 countries)
  ├─ France, Germany, Italy, Spain, Switzerland
  ├─ UK, Austria, Czech Republic, Poland
  └─ Belgium, Luxembourg

service_trackers (11 trackers)
  ├─ TwoService-France
  ├─ TwoService-Germany
  └─ ... (one per region)

field_definitions (25 dynamic fields)
  ├─ Customer section (7 fields)
  ├─ Device section (5 fields)
  ├─ Service section (9 fields)
  ├─ Dates section (4 fields)
  └─ Additional section (4 fields)

cases (20 sample cases)
  └─ All assigned to TwoService-France
```

### Security (Row Level Security)
- ✅ Partners can **only** see their tracker's cases
- ✅ Internal users see all cases
- ✅ All queries are scope-filtered at the database level

---

## Troubleshooting

### "relation does not exist"
- Run the migrations again in order
- Ensure all three migration files executed successfully

### "User ID not found" when inserting profiles
- Make sure you copied the correct User ID from the Authentication → Users table
- The ID is a UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### "Failed to insert cases"
- Ensure profiles were created first
- The import script needs at least one portal_admin user

---

## Next: Phase 2

Once setup is verified, you're ready for **Phase 2: Auth & Data Access Layer**

We'll build:
- `lib/auth/` - Role and scope checking functions
- `lib/data/` - Scoped data access with automatic audit logging
- Sign-in page
- Auth middleware
