-- Clean up any existing records and create fresh admin user
-- This script works WITH the profile trigger instead of against it

DO $$
DECLARE
  new_user_id uuid;
  admin_email text := 'info@brigadezmetal.com';
  admin_password text := 'Brigadezmetal@2024';
  admin_name text := 'Admin User';
BEGIN
  -- Step 1: Delete any existing profile records for this email
  DELETE FROM profiles WHERE email = admin_email;
  RAISE NOTICE 'Deleted existing profiles for %', admin_email;

  -- Step 2: Delete any existing auth user records for this email
  DELETE FROM auth.users WHERE email = admin_email;
  RAISE NOTICE 'Deleted existing auth users for %', admin_email;

  -- Step 3: Create fresh auth user
  -- The trigger will automatically create a profile
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', admin_name),
    false,
    now()
  ) RETURNING id INTO new_user_id;

  RAISE NOTICE 'Created auth user with ID: %', new_user_id;
  RAISE NOTICE 'Profile auto-created by trigger';

  -- Step 4: Update the auto-created profile to set role='admin'
  -- Using UPDATE instead of INSERT to work with the trigger
  UPDATE profiles 
  SET 
    role = 'admin',
    full_name = admin_name,
    updated_at = now()
  WHERE id = new_user_id;

  RAISE NOTICE 'Updated profile role to admin';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Admin account created successfully!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating admin: % %', SQLERRM, SQLSTATE;
END $$;
