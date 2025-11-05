-- Add enquiry_code column to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS enquiry_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_enquiry_code ON enquiries(enquiry_code);

-- Update existing enquiries with generated codes
DO $$
DECLARE
  rec RECORD;
  month_year TEXT;
  seq_num INTEGER;
  new_code TEXT;
BEGIN
  seq_num := 1;
  FOR rec IN SELECT id, created_at FROM enquiries WHERE enquiry_code IS NULL ORDER BY created_at
  LOOP
    month_year := TO_CHAR(rec.created_at, 'MMYY');
    new_code := 'BMC-' || month_year || '-' || LPAD(seq_num::TEXT, 4, '0');
    UPDATE enquiries SET enquiry_code = new_code WHERE id = rec.id;
    seq_num := seq_num + 1;
  END LOOP;
END $$;

-- Make enquiry_code NOT NULL after populating existing records
ALTER TABLE enquiries ALTER COLUMN enquiry_code SET NOT NULL;
