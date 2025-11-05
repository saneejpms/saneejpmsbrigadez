-- Complete fresh admin creation
-- This will work regardless of current state

DO $$
DECLARE
  admin_email TEXT := 'info@brigadezmetal.com';
  admin_password TEXT := 'Brigadezmetal@2024';
  admin_name TEXT := 'Admin User';
  new_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Step 1: Check if user exists in auth.users
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = admin_email;

  IF existing_user_id IS NOT NULL THEN
    -- User exists, update password
    RAISE NOTICE 'User exists with ID: %. Updating password...', existing_user_id;
    
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW()
    WHERE id = existing_user_id;
    
    new_user_id := existing_user_id;
    
    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
      -- Update existing profile
      UPDATE profiles
      SET 
        email = admin_email,
        full_name = admin_name,
        role = 'admin',
        updated_at = NOW()
      WHERE id = new_user_id;
      
      RAISE NOTICE 'Updated existing profile';
    ELSE
      -- Create profile
      INSERT INTO profiles (id, email, full_name, role)
      VALUES (new_user_id, admin_email, admin_name, 'admin');
      
      RAISE NOTICE 'Created new profile';
    END IF;
    
  ELSE
    -- User doesn't exist, create new
    RAISE NOTICE 'User does not exist. Creating new user...';
    
    -- Generate new UUID
    new_user_id := gen_random_uuid();
    
    -- Create user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
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
      new_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create profile (trigger might create it, but we'll ensure it exists)
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (new_user_id, admin_email, admin_name, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET 
      email = admin_email,
      full_name = admin_name,
      role = 'admin',
      updated_at = NOW();
    
    RAISE NOTICE 'Created new user and profile';
  END IF;

  RAISE NOTICE '=================================';
  RAISE NOTICE 'Admin user setup complete!';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'Password: %', admin_password;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE '=================================';
  
END $$;
