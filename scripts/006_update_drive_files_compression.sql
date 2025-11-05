-- Update drive_files table to include compression metadata
ALTER TABLE drive_files
ADD COLUMN IF NOT EXISTS original_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS stored_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS was_compressed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS compression_method TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Update existing indexes
CREATE INDEX IF NOT EXISTS idx_drive_files_user_id ON drive_files(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_created_at ON drive_files(created_at);
