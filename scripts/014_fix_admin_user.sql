-- Fix Admin User - Ensures admin user exists in both auth.users and profiles
-- Run this script if you're having login issues

DO $$
DECLARE
  admin_email TEXT := 'info@brigadezmetal.com';
  admin_password TEXT := 'Brigadezmetal@2024';
  admin_name TEXT := 'Admin User';
  auth_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- If user doesn't exist in auth.users, create it
  IF auth_user_id IS NULL THEN
    RAISE NOTICE 'Creating new auth user...';
    
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
      raw_app_meta_data,
      raw_user_meta_data,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
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
      '{"provider":"email","providers":["email"]}',
      '{}',
      '',
      '',
      '',
      ''
    ) RETURNING id INTO auth_user_id;
    
    RAISE NOTICE 'Auth user created with ID: %', auth_user_id;
  ELSE
    RAISE NOTICE 'Auth user already exists with ID: %', auth_user_id;
    
    -- Update password for existing user
    UPDATE auth.users
    SET encrypted_password = crypt(admin_password, gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    WHERE id = auth_user_id;
    
    RAISE NOTICE 'Password updated for existing user';
  END IF;

  -- Check if profile exists
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = auth_user_id
  ) INTO profile_exists;

  -- If profile doesn't exist, create it
  IF NOT profile_exists THEN
    RAISE NOTICE 'Creating profile...';
    
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (auth_user_id, admin_email, admin_name, 'admin');
    
    RAISE NOTICE 'Profile created successfully';
  ELSE
    RAISE NOTICE 'Profile already exists, updating role...';
    
    -- Update existing profile to ensure role is admin
    UPDATE profiles
    SET role = 'admin',
        full_name = admin_name,
        email = admin_email,
        updated_at = now()
    WHERE id = auth_user_id;
    
    RAISE NOTICE 'Profile updated successfully';
  END IF;

  RAISE NOTICE '✓ Admin user setup complete!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', auth_user_id;
  
END $$;
