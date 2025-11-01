-- ============================================================================
-- DBR Dashboard V2 - Row Level Security (RLS) Policies
-- ============================================================================
-- This migration sets up multi-tenant data isolation using RLS
-- Users can only access data for clients they belong to
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create user_clients junction table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure a user can only be added to a client once
  UNIQUE(user_id, client_id)
);

-- Index for faster lookups
CREATE INDEX idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX idx_user_clients_client_id ON user_clients(client_id);

-- ----------------------------------------------------------------------------
-- 2. Helper function: Check if user has access to client
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION user_has_client_access(client_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_clients
    WHERE user_id = auth.uid()
    AND client_id = client_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 3. Enable RLS on all tables
-- ----------------------------------------------------------------------------
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sophie_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4. RLS Policies: clients table
-- ----------------------------------------------------------------------------

-- Users can view clients they belong to
CREATE POLICY "Users can view their clients"
  ON clients FOR SELECT
  USING (user_has_client_access(id));

-- Users can insert clients (creating new ones)
CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  WITH CHECK (true);

-- Users can update clients they have access to
CREATE POLICY "Users can update their clients"
  ON clients FOR UPDATE
  USING (user_has_client_access(id))
  WITH CHECK (user_has_client_access(id));

-- Only owners can delete clients
CREATE POLICY "Owners can delete clients"
  ON clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_clients
      WHERE user_id = auth.uid()
      AND client_id = clients.id
      AND role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- 5. RLS Policies: user_clients table
-- ----------------------------------------------------------------------------

-- Users can view their own client associations
CREATE POLICY "Users can view their client associations"
  ON user_clients FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert themselves when creating a client
CREATE POLICY "Users can add themselves to clients"
  ON user_clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owners and admins can add other users
CREATE POLICY "Admins can add users to their clients"
  ON user_clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_clients existing
      WHERE existing.user_id = auth.uid()
      AND existing.client_id = user_clients.client_id
      AND existing.role IN ('owner', 'admin')
    )
  );

-- Owners and admins can update roles
CREATE POLICY "Admins can update user roles"
  ON user_clients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_clients existing
      WHERE existing.user_id = auth.uid()
      AND existing.client_id = user_clients.client_id
      AND existing.role IN ('owner', 'admin')
    )
  );

-- Owners can remove users
CREATE POLICY "Owners can remove users"
  ON user_clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_clients existing
      WHERE existing.user_id = auth.uid()
      AND existing.client_id = user_clients.client_id
      AND existing.role = 'owner'
    )
  );

-- ----------------------------------------------------------------------------
-- 6. RLS Policies: All client-scoped tables
-- ----------------------------------------------------------------------------

-- Campaign Settings
CREATE POLICY "Users can view campaign settings for their clients"
  ON campaign_settings FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create campaign settings for their clients"
  ON campaign_settings FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update campaign settings for their clients"
  ON campaign_settings FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete campaign settings for their clients"
  ON campaign_settings FOR DELETE
  USING (user_has_client_access(client_id));

-- Datasets
CREATE POLICY "Users can view datasets for their clients"
  ON datasets FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create datasets for their clients"
  ON datasets FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update datasets for their clients"
  ON datasets FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete datasets for their clients"
  ON datasets FOR DELETE
  USING (user_has_client_access(client_id));

-- Leads
CREATE POLICY "Users can view leads for their clients"
  ON leads FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create leads for their clients"
  ON leads FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update leads for their clients"
  ON leads FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete leads for their clients"
  ON leads FOR DELETE
  USING (user_has_client_access(client_id));

-- Conversations
CREATE POLICY "Users can view conversations for their clients"
  ON conversations FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create conversations for their clients"
  ON conversations FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update conversations for their clients"
  ON conversations FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete conversations for their clients"
  ON conversations FOR DELETE
  USING (user_has_client_access(client_id));

-- Messages
CREATE POLICY "Users can view messages for their clients"
  ON messages FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create messages for their clients"
  ON messages FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update messages for their clients"
  ON messages FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete messages for their clients"
  ON messages FOR DELETE
  USING (user_has_client_access(client_id));

-- Lessons
CREATE POLICY "Users can view lessons for their clients"
  ON lessons FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create lessons for their clients"
  ON lessons FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update lessons for their clients"
  ON lessons FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete lessons for their clients"
  ON lessons FOR DELETE
  USING (user_has_client_access(client_id));

-- Prompt Templates
CREATE POLICY "Users can view prompt templates for their clients"
  ON prompt_templates FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create prompt templates for their clients"
  ON prompt_templates FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update prompt templates for their clients"
  ON prompt_templates FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete prompt templates for their clients"
  ON prompt_templates FOR DELETE
  USING (user_has_client_access(client_id));

-- Prompts
CREATE POLICY "Users can view prompts for their clients"
  ON prompts FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create prompts for their clients"
  ON prompts FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update prompts for their clients"
  ON prompts FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete prompts for their clients"
  ON prompts FOR DELETE
  USING (user_has_client_access(client_id));

-- Prompt Versions
CREATE POLICY "Users can view prompt versions for their clients"
  ON prompt_versions FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create prompt versions for their clients"
  ON prompt_versions FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update prompt versions for their clients"
  ON prompt_versions FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete prompt versions for their clients"
  ON prompt_versions FOR DELETE
  USING (user_has_client_access(client_id));

-- Sophie Insights
CREATE POLICY "Users can view Sophie insights for their clients"
  ON sophie_insights FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create Sophie insights for their clients"
  ON sophie_insights FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update Sophie insights for their clients"
  ON sophie_insights FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete Sophie insights for their clients"
  ON sophie_insights FOR DELETE
  USING (user_has_client_access(client_id));

-- Uploads
CREATE POLICY "Users can view uploads for their clients"
  ON uploads FOR SELECT
  USING (user_has_client_access(client_id));

CREATE POLICY "Users can create uploads for their clients"
  ON uploads FOR INSERT
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can update uploads for their clients"
  ON uploads FOR UPDATE
  USING (user_has_client_access(client_id))
  WITH CHECK (user_has_client_access(client_id));

CREATE POLICY "Users can delete uploads for their clients"
  ON uploads FOR DELETE
  USING (user_has_client_access(client_id));

-- ----------------------------------------------------------------------------
-- 7. Triggers for updated_at timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_clients_updated_at
  BEFORE UPDATE ON user_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- End of RLS Policies Migration
-- ============================================================================
