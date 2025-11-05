-- Create enquiry_milestones table for project milestone tracking
CREATE TABLE IF NOT EXISTS enquiry_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  quote_given BOOLEAN DEFAULT FALSE,
  quote_given_at TIMESTAMPTZ,
  quote_given_by UUID REFERENCES profiles(id),
  advance_invoice_given BOOLEAN DEFAULT FALSE,
  advance_invoice_given_at TIMESTAMPTZ,
  advance_invoice_given_by UUID REFERENCES profiles(id),
  advance_invoice_credited BOOLEAN DEFAULT FALSE,
  advance_invoice_credited_at TIMESTAMPTZ,
  advance_invoice_credited_by UUID REFERENCES profiles(id),
  work_started BOOLEAN DEFAULT FALSE,
  work_started_at TIMESTAMPTZ,
  work_started_by UUID REFERENCES profiles(id),
  work_completed BOOLEAN DEFAULT FALSE,
  work_completed_at TIMESTAMPTZ,
  work_completed_by UUID REFERENCES profiles(id),
  rectification_required BOOLEAN DEFAULT FALSE,
  rectification_required_at TIMESTAMPTZ,
  rectification_required_by UUID REFERENCES profiles(id),
  rectification_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_enquiry_milestones_enquiry_id ON enquiry_milestones(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_milestones_updated_at ON enquiry_milestones(updated_at);
