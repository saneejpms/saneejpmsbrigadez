-- Verification script to check if all tables and functions exist
-- Run this to diagnose database setup issues

-- Check if all required tables exist
SELECT 
  'Tables Check' as check_type,
  CASE 
    WHEN COUNT(*) = 8 THEN 'PASS: All 8 tables exist'
    ELSE 'FAIL: Missing tables. Found ' || COUNT(*) || ' of 8'
  END as status,
  string_agg(table_name, ', ') as existing_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles', 'clients', 'enquiries', 'materials', 
    'commercials', 'expenses', 'schedules', 'drive_files'
  );

-- Check if profiles table has role column
SELECT 
  'Profiles Role Column' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN 'PASS: Role column exists'
    ELSE 'FAIL: Role column missing'
  END as status;

-- Check if drive_files has client_id column
SELECT 
  'Drive Files Client ID' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'drive_files' AND column_name = 'client_id'
    ) THEN 'PASS: Client ID column exists'
    ELSE 'FAIL: Client ID column missing'
  END as status;

-- Check if profile trigger exists
SELECT 
  'Profile Trigger' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'on_auth_user_created'
    ) THEN 'PASS: Profile trigger exists'
    ELSE 'FAIL: Profile trigger missing'
  END as status;

-- Check if any users exist
SELECT 
  'Users Count' as check_type,
  'INFO: ' || COUNT(*) || ' users in auth.users' as status
FROM auth.users;

-- Check if any profiles exist
SELECT 
  'Profiles Count' as check_type,
  'INFO: ' || COUNT(*) || ' profiles exist' as status
FROM profiles;

-- Check for admin users
SELECT 
  'Admin Users' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS: ' || COUNT(*) || ' admin user(s) found'
    ELSE 'FAIL: No admin users found'
  END as status
FROM profiles 
WHERE role = 'admin';

-- List all admin users
SELECT 
  'Admin User Details' as info_type,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE role = 'admin';
