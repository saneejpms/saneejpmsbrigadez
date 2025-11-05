-- Create admin user for Brigadez PMS
-- Email: admin@brigadez.com
-- Password: Brigadezmetal@2024

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create auth user
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
    raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@brigadez.com',
    crypt('Brigadezmetal@2024', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}'
  ) RETURNING id INTO new_user_id;

  -- Create admin profile with role
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    new_user_id, 
    'admin@brigadez.com',
    'Brigadez Admin', 
    'admin'
  );
  
  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END $$;
