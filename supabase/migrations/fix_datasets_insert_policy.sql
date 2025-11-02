-- Fix INSERT policy for datasets table
-- The policy exists but may not be working correctly

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create datasets for their client" ON datasets;

-- Recreate the INSERT policy
CREATE POLICY "Users can create datasets for their client"
  ON datasets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT client_id
      FROM user_clients
      WHERE user_id = auth.uid()
    )
  );

-- Verify the policy was created
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'datasets' AND cmd = 'INSERT';
