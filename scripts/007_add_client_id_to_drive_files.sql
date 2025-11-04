-- Add client_id column to drive_files table to support linking files to clients
-- This allows files to be associated with either enquiries or clients

ALTER TABLE drive_files
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_drive_files_client_id ON drive_files(client_id);

-- Update RLS policies to include client_id
-- Users can view files linked to their clients
DROP POLICY IF EXISTS "Users can view own drive files" ON drive_files;
CREATE POLICY "Users can view own drive files" ON drive_files
  FOR SELECT USING (
    auth.uid() = user_id OR
    enquiry_id IN (SELECT id FROM enquiries WHERE user_id = auth.uid()) OR
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
  );

-- Users can insert files for their enquiries or clients
DROP POLICY IF EXISTS "Users can insert own drive files" ON drive_files;
CREATE POLICY "Users can insert own drive files" ON drive_files
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      enquiry_id IS NULL OR
      enquiry_id IN (SELECT id FROM enquiries WHERE user_id = auth.uid()) OR
      client_id IS NULL OR
      client_id IN (SELECT id FROM clients WHERE user_id = auth.uid())
    )
  );

-- Users can update their own files
DROP POLICY IF EXISTS "Users can update own drive files" ON drive_files;
CREATE POLICY "Users can update own drive files" ON drive_files
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own drive files" ON drive_files;
CREATE POLICY "Users can delete own drive files" ON drive_files
  FOR DELETE USING (auth.uid() = user_id);
