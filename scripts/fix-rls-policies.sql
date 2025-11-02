-- Fix RLS policies for datasets table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their client's datasets" ON datasets;
DROP POLICY IF EXISTS "Users can create datasets for their client" ON datasets;
DROP POLICY IF EXISTS "Users can update their client's datasets" ON datasets;
DROP POLICY IF EXISTS "Users can delete their client's datasets" ON datasets;

-- Enable RLS on datasets table (if not already enabled)
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view datasets from their client
CREATE POLICY "Users can view their client's datasets"
ON datasets FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Policy: Users can create datasets for their client
CREATE POLICY "Users can create datasets for their client"
ON datasets FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update their client's datasets
CREATE POLICY "Users can update their client's datasets"
ON datasets FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Policy: Users can delete their client's datasets
CREATE POLICY "Users can delete their client's datasets"
ON datasets FOR DELETE
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

-- Do the same for leads table
DROP POLICY IF EXISTS "Users can view their client's leads" ON leads;
DROP POLICY IF EXISTS "Users can create leads for their client" ON leads;
DROP POLICY IF EXISTS "Users can update their client's leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their client's leads" ON leads;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client's leads"
ON leads FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create leads for their client"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their client's leads"
ON leads FOR UPDATE
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their client's leads"
ON leads FOR DELETE
TO authenticated
USING (
  client_id IN (
    SELECT client_id FROM user_clients WHERE user_id = auth.uid()
  )
);
