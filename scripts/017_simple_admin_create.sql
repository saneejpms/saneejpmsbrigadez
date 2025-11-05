-- Simple admin user creation
-- Run this in Supabase SQL Editor

-- First, clean up any existing records
DELETE FROM profiles WHERE email = 'info@brigadezmetal.com';
DELETE FROM auth.users WHERE email = 'info@brigadezmetal.com';

-- Create the admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'info@brigadezmetal.com',
  crypt('Brigadezmetal@2024', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id;

-- Note: The profile will be created automatically by the trigger
-- Wait a moment, then verify with:
-- SELECT * FROM auth.users WHERE email = 'info@brigadezmetal.com';
-- SELECT * FROM profiles WHERE email = 'info@brigadezmetal.com';
