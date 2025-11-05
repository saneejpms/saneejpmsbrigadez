-- Check if admin user exists and show current state
-- Run this first to see what's in your database

-- Check auth.users table
SELECT 
  'AUTH.USERS' as table_name,
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE WHEN encrypted_password IS NOT NULL THEN 'Password Set' ELSE 'No Password' END as password_status
FROM auth.users 
WHERE email = 'info@brigadezmetal.com';

-- Check profiles table
SELECT 
  'PROFILES' as table_name,
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email = 'info@brigadezmetal.com';

-- Check if there are ANY users at all
SELECT 
  'TOTAL AUTH USERS' as info,
  COUNT(*) as count
FROM auth.users;

SELECT 
  'TOTAL PROFILES' as info,
  COUNT(*) as count
FROM profiles;
