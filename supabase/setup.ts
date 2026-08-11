/**
 * Supabase Database Setup Script
 * Runs migrations, creates users, and seeds data
 *
 * Usage: npx tsx supabase/setup.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test users to create
const TEST_USERS = [
  {
    email: 'admin@evident.com',
    password: 'Password123!',
    full_name: 'System Administrator',
    role: 'portal_admin',
  },
  {
    email: 'manager@evident.com',
    password: 'Password123!',
    full_name: 'Internal Manager',
    role: 'internal_manager',
  },
  {
    email: 'user@evident.com',
    password: 'Password123!',
    full_name: 'Internal User',
    role: 'internal_user',
  },
];

async function runMigration(filename: string) {
  console.log(`\n📄 Running migration: ${filename}`);

  const sqlPath = join(__dirname, 'migrations', filename);
  const sql = readFileSync(sqlPath, 'utf-8');

  // Note: This requires service_role key for direct SQL execution
  // For now, we'll output instructions
  console.log('⚠️  SQL migrations need to be run manually via Supabase Studio');
  console.log('   Dashboard → SQL Editor → paste the migration file content');
}

async function setupDatabase() {
  console.log('🚀 Evident Case Portal - Database Setup\n');
  console.log('==========================================\n');

  // Step 1: Instructions for manual SQL execution
  console.log('STEP 1: Run SQL Migrations');
  console.log('---------------------------');
  console.log('Please run the following migration files in Supabase Studio SQL Editor:');
  console.log('1. supabase/migrations/20260811_001_initial_schema.sql');
  console.log('2. supabase/migrations/20260811_002_rls_policies.sql');
  console.log('3. supabase/migrations/20260811_003_seed_data.sql');
  console.log('\nNavigate to: https://supabase.com/dashboard/project/_/sql/new');
  console.log('\n✅ Complete this step, then press Enter to continue...\n');

  // Wait for user confirmation
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });

  // Step 2: Create test users
  console.log('\nSTEP 2: Creating Test Users');
  console.log('---------------------------');

  for (const user of TEST_USERS) {
    console.log(`\nCreating user: ${user.email} (${user.role})`);

    // Note: User creation via anon key won't work - needs admin API
    // This is for demonstration
    console.log('⚠️  User creation requires Supabase Admin API');
    console.log(`   Please create user manually in Supabase Dashboard:`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Password: ${user.password}`);
    console.log(`   - Then insert into profiles table:`);
    console.log(`     INSERT INTO profiles (id, email, full_name, role)`);
    console.log(`     VALUES ('<user_id>', '${user.email}', '${user.full_name}', '${user.role}');`);
  }

  console.log('\n==========================================');
  console.log('⚠️  MANUAL SETUP REQUIRED\n');
  console.log('This script provides instructions. To complete setup:');
  console.log('1. Run the 3 migration SQL files in Supabase Studio SQL Editor');
  console.log('2. Create the 3 test users in Authentication → Add User');
  console.log('3. Insert their profile records with the SQL shown above');
  console.log('\nAlternatively, provide the SERVICE_ROLE_KEY for automated setup.');
  console.log('==========================================\n');
}

setupDatabase().catch(console.error);
