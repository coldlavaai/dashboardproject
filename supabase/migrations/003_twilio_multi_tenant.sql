-- ============================================================================
-- Multi-Tenant Twilio Configuration
-- ============================================================================
-- This migration adds support for multiple Twilio phone numbers per client
-- and proper credential storage at the client level
-- ============================================================================

-- Add Twilio credentials to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT,
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT;

-- Create phone_numbers table for managing multiple numbers per client
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ownership
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  -- Phone Number Details
  phone_number TEXT NOT NULL,
  label TEXT, -- e.g., "Main Sales Line", "Campaign 1", "Dataset: Greenstar"

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Usage tracking
  datasets_count INTEGER DEFAULT 0,
  total_messages_sent INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,

  CONSTRAINT phone_numbers_client_phone_unique UNIQUE(client_id, phone_number)
);

CREATE INDEX idx_phone_numbers_client_id ON phone_numbers(client_id);
CREATE INDEX idx_phone_numbers_is_active ON phone_numbers(is_active);
CREATE INDEX idx_phone_numbers_is_default ON phone_numbers(is_default);

-- Add phone_number_id to datasets to assign specific numbers
ALTER TABLE datasets
ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES phone_numbers(id) ON DELETE SET NULL;

CREATE INDEX idx_datasets_phone_number_id ON datasets(phone_number_id);

-- Auto-update timestamp trigger for phone_numbers
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update datasets_count on phone_numbers
CREATE OR REPLACE FUNCTION update_phone_number_dataset_count()
RETURNS TRIGGER AS $$
DECLARE
  target_phone_id UUID;
  old_phone_id UUID;
BEGIN
  -- Handle different trigger operations
  IF TG_OP = 'DELETE' THEN
    target_phone_id := OLD.phone_number_id;
  ELSIF TG_OP = 'UPDATE' THEN
    target_phone_id := NEW.phone_number_id;
    old_phone_id := OLD.phone_number_id;

    -- Update old phone number count if it changed
    IF old_phone_id IS NOT NULL AND old_phone_id != target_phone_id THEN
      UPDATE phone_numbers
      SET datasets_count = (
        SELECT COUNT(*) FROM datasets WHERE phone_number_id = old_phone_id
      )
      WHERE id = old_phone_id;
    END IF;
  ELSE
    target_phone_id := NEW.phone_number_id;
  END IF;

  -- Update current phone number count
  IF target_phone_id IS NOT NULL THEN
    UPDATE phone_numbers
    SET datasets_count = (
      SELECT COUNT(*) FROM datasets WHERE phone_number_id = target_phone_id
    )
    WHERE id = target_phone_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_phone_number_dataset_count
  AFTER INSERT OR UPDATE OR DELETE ON datasets
  FOR EACH ROW
  WHEN (NEW.phone_number_id IS NOT NULL OR OLD.phone_number_id IS NOT NULL)
  EXECUTE FUNCTION update_phone_number_dataset_count();

-- RLS Policies for phone_numbers
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own phone numbers"
  ON phone_numbers FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own phone numbers"
  ON phone_numbers FOR INSERT
  WITH CHECK (client_id IN (
    SELECT client_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own phone numbers"
  ON phone_numbers FOR UPDATE
  USING (client_id IN (
    SELECT client_id FROM users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own phone numbers"
  ON phone_numbers FOR DELETE
  USING (client_id IN (
    SELECT client_id FROM users WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- Migration Notes:
-- ============================================================================
-- After running this migration:
-- 1. Clients can add Twilio Account SID and Auth Token in Settings
-- 2. Clients can add multiple phone numbers
-- 3. Each dataset can be assigned a specific phone number
-- 4. If no phone number assigned to dataset, system falls back to client default
-- 5. Phone numbers track how many datasets use them
-- ============================================================================
