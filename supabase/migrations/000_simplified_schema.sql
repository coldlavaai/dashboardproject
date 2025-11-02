-- ============================================================================
-- Simplified DBR Dashboard Schema
-- ============================================================================
-- This creates the minimum tables needed to get the app working
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLE: clients
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  company_name TEXT NOT NULL UNIQUE,
  company_email TEXT,
  company_phone TEXT,
  industry TEXT DEFAULT 'solar',

  status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ============================================================================
-- TABLE: users (Dashboard users with profile data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  is_super_admin BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON users(is_super_admin);

-- ============================================================================
-- TABLE: user_clients (Multi-tenant user-client relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner', -- owner, admin, member

  UNIQUE(user_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_user_clients_user_id ON user_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_user_clients_client_id ON user_clients(client_id);

-- ============================================================================
-- TABLE: datasets
-- ============================================================================
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'manual',

  uploaded_file_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),

  column_mapping JSONB,

  total_leads INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_converted INTEGER DEFAULT 0,

  CONSTRAINT datasets_name_client_unique UNIQUE(client_id, name)
);

CREATE INDEX IF NOT EXISTS idx_datasets_client_id ON datasets(client_id);

-- ============================================================================
-- TABLE: leads
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,

  first_name TEXT NOT NULL,
  last_name TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  postcode TEXT,

  inquiry_date DATE,
  notes TEXT,

  contact_status TEXT DEFAULT 'READY',
  lead_sentiment TEXT,

  m1_sent_at TIMESTAMPTZ,
  m2_sent_at TIMESTAMPTZ,
  m3_sent_at TIMESTAMPTZ,
  reply_received_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,

  call_booked BOOLEAN DEFAULT FALSE,
  call_booked_time TIMESTAMPTZ,

  manual_mode BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,

  CONSTRAINT leads_phone_dataset_unique UNIQUE(dataset_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_dataset_id ON leads(dataset_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact_status ON leads(contact_status);
CREATE INDEX IF NOT EXISTS idx_leads_phone_number ON leads(phone_number);

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_clients_updated_at BEFORE UPDATE ON user_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Clients: Users can view clients they belong to
CREATE POLICY "Users can view their clients"
  ON clients FOR SELECT
  USING (
    id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their clients"
  ON clients FOR UPDATE
  USING (
    id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Users: Can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- User_Clients: Users can view their client associations
CREATE POLICY "Users can view their client associations"
  ON user_clients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves to clients"
  ON user_clients FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Datasets: Users can view/create/update/delete datasets for their clients
CREATE POLICY "Users can view their client's datasets"
  ON datasets FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create datasets for their client"
  ON datasets FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their client's datasets"
  ON datasets FOR UPDATE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their client's datasets"
  ON datasets FOR DELETE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- Leads: Users can view/create/update/delete leads for their clients
CREATE POLICY "Users can view their client's leads"
  ON leads FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leads for their client"
  ON leads FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their client's leads"
  ON leads FOR UPDATE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their client's leads"
  ON leads FOR DELETE
  USING (
    client_id IN (
      SELECT client_id FROM user_clients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
