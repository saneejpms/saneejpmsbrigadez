-- Enable RLS for schedules table
-- This script adds Row Level Security to the existing schedules table

-- Enable RLS on schedules table
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (just in case)
DROP POLICY IF EXISTS "Users can view own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;

-- Create RLS policies for schedules
CREATE POLICY "Users can view own schedules"
  ON schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedules"
  ON schedules
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedules"
  ON schedules
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own schedules"
  ON schedules
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_enquiry_id ON schedules(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_schedules_start_date ON schedules(start_date);
