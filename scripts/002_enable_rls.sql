-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercials ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE drive_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to make script idempotent

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Clients policies
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Enquiries policies
DROP POLICY IF EXISTS "Users can view own enquiries" ON enquiries;
CREATE POLICY "Users can view own enquiries"
  ON enquiries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own enquiries" ON enquiries;
CREATE POLICY "Users can insert own enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own enquiries" ON enquiries;
CREATE POLICY "Users can update own enquiries"
  ON enquiries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own enquiries" ON enquiries;
CREATE POLICY "Users can delete own enquiries"
  ON enquiries FOR DELETE
  USING (auth.uid() = user_id);

-- Materials policies
DROP POLICY IF EXISTS "Users can view own materials" ON materials;
CREATE POLICY "Users can view own materials"
  ON materials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own materials" ON materials;
CREATE POLICY "Users can insert own materials"
  ON materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own materials" ON materials;
CREATE POLICY "Users can update own materials"
  ON materials FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own materials" ON materials;
CREATE POLICY "Users can delete own materials"
  ON materials FOR DELETE
  USING (auth.uid() = user_id);

-- Commercials policies
DROP POLICY IF EXISTS "Users can view own commercials" ON commercials;
CREATE POLICY "Users can view own commercials"
  ON commercials FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own commercials" ON commercials;
CREATE POLICY "Users can insert own commercials"
  ON commercials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own commercials" ON commercials;
CREATE POLICY "Users can update own commercials"
  ON commercials FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own commercials" ON commercials;
CREATE POLICY "Users can delete own commercials"
  ON commercials FOR DELETE
  USING (auth.uid() = user_id);

-- Expenses policies
DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Schedules policies
DROP POLICY IF EXISTS "Users can view own schedules" ON schedules;
CREATE POLICY "Users can view own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own schedules" ON schedules;
CREATE POLICY "Users can insert own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own schedules" ON schedules;
CREATE POLICY "Users can update own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own schedules" ON schedules;
CREATE POLICY "Users can delete own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Drive files policies
DROP POLICY IF EXISTS "Users can view own drive files" ON drive_files;
CREATE POLICY "Users can view own drive files"
  ON drive_files FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own drive files" ON drive_files;
CREATE POLICY "Users can insert own drive files"
  ON drive_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own drive files" ON drive_files;
CREATE POLICY "Users can update own drive files"
  ON drive_files FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own drive files" ON drive_files;
CREATE POLICY "Users can delete own drive files"
  ON drive_files FOR DELETE
  USING (auth.uid() = user_id);
