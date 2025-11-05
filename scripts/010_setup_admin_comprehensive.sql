-- Comprehensive Admin Setup Script
-- This handles all scenarios: user exists, profile exists, or neither exists

DO $$
DECLARE
  existing_user_id uuid;
  existing_profile_id uuid;
  new_user_id uuid;
  admin_email text := 'info@brigadezmetal.com';
  admin_password text := 'Brigadezmetal@2024';
  admin_name text := 'Admin User';
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- Check if profile exists
  SELECT id INTO existing_profile_id
  FROM profiles
  WHERE email = admin_email;

  -- Scenario 1: Both user and profile exist
  IF existing_user_id IS NOT NULL AND existing_profile_id IS NOT NULL THEN
    RAISE NOTICE 'User and profile already exist. Updating password and role...';
    
    -- Update password in auth.users
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      updated_at = now()
    WHERE id = existing_user_id;
    
    -- Update role in profiles
    UPDATE profiles
    SET 
      role = 'admin',
      full_name = admin_name,
      updated_at = now()
    WHERE id = existing_profile_id;
    
    RAISE NOTICE 'Admin user updated successfully. ID: %', existing_user_id;

  -- Scenario 2: Only profile exists (orphaned profile)
  ELSIF existing_user_id IS NULL AND existing_profile_id IS NOT NULL THEN
    RAISE NOTICE 'Orphaned profile found. Deleting and recreating...';
    
    -- Delete orphaned profile
    DELETE FROM profiles WHERE id = existing_profile_id;
    
    -- Create new auth user
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
      recovery_token,
      email_change_token_new
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
      ''
    ) RETURNING id INTO new_user_id;
    
    -- Create new profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (new_user_id, admin_email, admin_name, 'admin');
    
    RAISE NOTICE 'Admin user created successfully. ID: %', new_user_id;

  -- Scenario 3: Only auth user exists (no profile)
  ELSIF existing_user_id IS NOT NULL AND existing_profile_id IS NULL THEN
    RAISE NOTICE 'Auth user exists but no profile. Creating profile...';
    
    -- Update password
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      updated_at = now()
    WHERE id = existing_user_id;
    
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (existing_user_id, admin_email, admin_name, 'admin');
    
    RAISE NOTICE 'Profile created for existing user. ID: %', existing_user_id;

  -- Scenario 4: Neither exists (fresh creation)
  ELSE
    RAISE NOTICE 'No existing user or profile. Creating fresh...';
    
    -- Create new auth user
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
      recovery_token,
      email_change_token_new
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
      ''
    ) RETURNING id INTO new_user_id;
    
    -- Create new profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (new_user_id, admin_email, admin_name, 'admin');
    
    RAISE NOTICE 'Admin user created successfully. ID: %', new_user_id;
  END IF;

  -- Final verification
  SELECT id INTO existing_user_id FROM auth.users WHERE email = admin_email;
  SELECT id INTO existing_profile_id FROM profiles WHERE email = admin_email;
  
  IF existing_user_id IS NOT NULL AND existing_profile_id IS NOT NULL THEN
    RAISE NOTICE '✓ Admin setup complete!';
    RAISE NOTICE '  Email: %', admin_email;
    RAISE NOTICE '  Password: %', admin_password;
    RAISE NOTICE '  User ID: %', existing_user_id;
  ELSE
    RAISE EXCEPTION 'Admin setup failed. Please check the logs.';
  END IF;

END $$;
