-- Update existing admin user password and role
-- Run this if you get "duplicate key" error

DO $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Find the existing user
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = 'info@brigadezmetal.com';

  IF existing_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email info@brigadezmetal.com not found';
  END IF;

  -- Update the password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt('Brigadezmetal@2024', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
  WHERE id = existing_user_id;

  -- Update or insert the profile
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    existing_user_id,
    'info@brigadezmetal.com',
    'Admin User',
    'admin'
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    role = 'admin',
    full_name = 'Admin User',
    updated_at = now();

  RAISE NOTICE 'Admin user updated successfully with ID: %', existing_user_id;
END $$;
