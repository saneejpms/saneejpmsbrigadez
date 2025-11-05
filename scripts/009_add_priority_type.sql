-- Add priority_type column to enquiries table
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS priority_type text CHECK (priority_type IN ('drawing', 'quote', 'work'));

-- Create index for efficient priority type queries
CREATE INDEX IF NOT EXISTS idx_enquiries_priority_type
  ON enquiries (priority_type) WHERE is_priority = true;

-- Add comment for documentation
COMMENT ON COLUMN enquiries.priority_type IS 'Type of priority: drawing, quote, or work';
