-- Diagnostic Query: Check existing admin records
-- Run this first to see what's in your database

-- Fixed type mismatch by casting id to text in both queries
SELECT 'AUTH USERS' as table_name, id::text, email, created_at 
FROM auth.users 
WHERE email = 'info@brigadezmetal.com'

UNION ALL

SELECT 'PROFILES' as table_name, id::text, email, created_at 
FROM profiles 
WHERE email = 'info@brigadezmetal.com';

-- This will show you if there are mismatched or orphaned records
