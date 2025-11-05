-- Add priority fields to enquiries table
ALTER TABLE enquiries
  ADD COLUMN IF NOT EXISTS is_priority boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority_rank integer;

-- Create index for efficient priority queries
CREATE INDEX IF NOT EXISTS idx_enquiries_priority
  ON enquiries (is_priority, priority_rank NULLS LAST);

-- Add comment for documentation
COMMENT ON COLUMN enquiries.is_priority IS 'Whether this enquiry is in the priority list';
COMMENT ON COLUMN enquiries.priority_rank IS 'Order rank in the priority list (lower = higher priority)';
