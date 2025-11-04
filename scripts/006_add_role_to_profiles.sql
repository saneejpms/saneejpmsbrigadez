-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'estimator', 'designer', 'user'));

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing profiles to have 'user' role if NULL
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: admin, estimator, designer, or user';
