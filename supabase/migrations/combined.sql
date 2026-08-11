-- =============================================
-- Evident Case Portal - Initial Schema
-- Phase 1: Database tables + Row Level Security
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('portal_admin', 'internal_manager', 'internal_user', 'service_partner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);

-- =============================================
-- 2. REGIONS (EMEA countries)
-- =============================================
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. SERVICE TRACKERS (TwoService-{Country})
-- =============================================
CREATE TABLE IF NOT EXISTS service_trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for region lookups
CREATE INDEX idx_service_trackers_region ON service_trackers(region_id);

-- =============================================
-- 4. USER_TRACKERS (partner scope)
-- =============================================
CREATE TABLE IF NOT EXISTS user_trackers (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_tracker_id UUID NOT NULL REFERENCES service_trackers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, service_tracker_id)
);

-- =============================================
-- 5. FIELD DEFINITIONS (dynamic fields metadata)
-- =============================================
CREATE TABLE IF NOT EXISTS field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('text', 'number', 'date', 'select', 'textarea', 'boolean')),
  options JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated')),
  visible_to_roles TEXT[] NOT NULL DEFAULT ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'],
  section TEXT NOT NULL CHECK (section IN ('customer', 'device', 'service', 'dates', 'additional')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active field lookups
CREATE INDEX idx_field_definitions_status ON field_definitions(status);
CREATE INDEX idx_field_definitions_section ON field_definitions(section);

-- =============================================
-- 6. CASES (main entity)
-- =============================================
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number INTEGER NOT NULL UNIQUE,
  service_order TEXT,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'scheduled', 'on_hold', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  region_id UUID NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  service_tracker_id UUID NOT NULL REFERENCES service_trackers(id) ON DELETE RESTRICT,
  data JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_region ON cases(region_id);
CREATE INDEX idx_cases_tracker ON cases(service_tracker_id);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_updated_at ON cases(updated_at DESC);

-- GIN index for JSONB data field queries
CREATE INDEX idx_cases_data ON cases USING GIN(data);

-- =============================================
-- 7. CASE EVENTS (audit log)
-- =============================================
CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'status_change', 'comment_added', 'document_added')),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX idx_case_events_case ON case_events(case_id);
CREATE INDEX idx_case_events_created_at ON case_events(created_at DESC);
CREATE INDEX idx_case_events_type ON case_events(event_type);

-- =============================================
-- 8. CASE VIEWS (change awareness)
-- =============================================
CREATE TABLE IF NOT EXISTS case_views (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, case_id)
);

-- Index for user's viewed cases
CREATE INDEX idx_case_views_user ON case_views(user_id);

-- =============================================
-- 9. CASE COMMENTS (collaboration)
-- =============================================
CREATE TABLE IF NOT EXISTS case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for case comments
CREATE INDEX idx_case_comments_case ON case_comments(case_id);
CREATE INDEX idx_case_comments_created_at ON case_comments(created_at DESC);

-- =============================================
-- 10. CASE DOCUMENTS (Supabase Storage refs)
-- =============================================
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for case documents
CREATE INDEX idx_case_documents_case ON case_documents(case_id);

-- =============================================
-- 11. NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('status_change', 'new_comment', 'assignment', 'new_document', 'case_created')),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  payload JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notification queries
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =============================================
-- TRIGGERS: updated_at timestamps
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_comments_updated_at
  BEFORE UPDATE ON case_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- =============================================
-- Row Level Security (RLS) Policies
-- Enforce scope-based access control
-- =============================================

-- =============================================
-- Enable RLS on all tables
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Helper function: Get user's role
-- =============================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================
-- Helper function: Check if user has tracker access
-- =============================================

CREATE OR REPLACE FUNCTION user_has_tracker_access(tracker_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_trackers
    WHERE user_id = auth.uid() AND service_tracker_id = tracker_id
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =============================================
-- PROFILES: Users can read all profiles, update own
-- =============================================

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage profiles"
  ON profiles FOR ALL
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- REGIONS: All authenticated users can read
-- =============================================

CREATE POLICY "All users can view regions"
  ON regions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage regions"
  ON regions FOR ALL
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- SERVICE_TRACKERS: All authenticated users can read
-- =============================================

CREATE POLICY "All users can view service trackers"
  ON service_trackers FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage service trackers"
  ON service_trackers FOR ALL
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- USER_TRACKERS: Users see own assignments
-- =============================================

CREATE POLICY "Users can view own tracker assignments"
  ON user_trackers FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() IN ('portal_admin', 'internal_manager'));

CREATE POLICY "Only admins can manage user tracker assignments"
  ON user_trackers FOR ALL
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- FIELD_DEFINITIONS: All users can read active fields
-- =============================================

CREATE POLICY "All users can view field definitions"
  ON field_definitions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage field definitions"
  ON field_definitions FOR ALL
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- CASES: Scope-based access (THE CRITICAL POLICY)
-- =============================================

-- SELECT: Users see cases based on role + scope
CREATE POLICY "Users can view cases based on scope"
  ON cases FOR SELECT
  USING (
    get_user_role() = 'portal_admin' OR
    get_user_role() IN ('internal_manager', 'internal_user') OR
    (get_user_role() = 'service_partner' AND user_has_tracker_access(service_tracker_id))
  );

-- INSERT: Users can create cases in their scope
CREATE POLICY "Users can create cases in their scope"
  ON cases FOR INSERT
  WITH CHECK (
    get_user_role() = 'portal_admin' OR
    get_user_role() IN ('internal_manager', 'internal_user') OR
    (get_user_role() = 'service_partner' AND user_has_tracker_access(service_tracker_id))
  );

-- UPDATE: Users can update cases in their scope
CREATE POLICY "Users can update cases in their scope"
  ON cases FOR UPDATE
  USING (
    get_user_role() = 'portal_admin' OR
    get_user_role() IN ('internal_manager', 'internal_user') OR
    (get_user_role() = 'service_partner' AND user_has_tracker_access(service_tracker_id))
  );

-- DELETE: Only admins can delete cases
CREATE POLICY "Only admins can delete cases"
  ON cases FOR DELETE
  USING (get_user_role() = 'portal_admin');

-- =============================================
-- CASE_EVENTS: Read access mirrors case access
-- =============================================

CREATE POLICY "Users can view events for accessible cases"
  ON case_events FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM cases
      WHERE cases.id = case_events.case_id
      AND (
        get_user_role() = 'portal_admin' OR
        get_user_role() IN ('internal_manager', 'internal_user') OR
        (get_user_role() = 'service_partner' AND user_has_tracker_access(cases.service_tracker_id))
      )
    )
  );

CREATE POLICY "System can insert case events"
  ON case_events FOR INSERT
  WITH CHECK (true);

-- =============================================
-- CASE_VIEWS: Users manage own views
-- =============================================

CREATE POLICY "Users can manage own case views"
  ON case_views FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- CASE_COMMENTS: Scope-based access
-- =============================================

CREATE POLICY "Users can view comments for accessible cases"
  ON case_comments FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM cases
      WHERE cases.id = case_comments.case_id
      AND (
        get_user_role() = 'portal_admin' OR
        get_user_role() IN ('internal_manager', 'internal_user') OR
        (get_user_role() = 'service_partner' AND user_has_tracker_access(cases.service_tracker_id))
      )
    )
  );

CREATE POLICY "Users can add comments to accessible cases"
  ON case_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS(
      SELECT 1 FROM cases
      WHERE cases.id = case_comments.case_id
      AND (
        get_user_role() = 'portal_admin' OR
        get_user_role() IN ('internal_manager', 'internal_user') OR
        (get_user_role() = 'service_partner' AND user_has_tracker_access(cases.service_tracker_id))
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON case_comments FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- CASE_DOCUMENTS: Scope-based access
-- =============================================

CREATE POLICY "Users can view documents for accessible cases"
  ON case_documents FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM cases
      WHERE cases.id = case_documents.case_id
      AND (
        get_user_role() = 'portal_admin' OR
        get_user_role() IN ('internal_manager', 'internal_user') OR
        (get_user_role() = 'service_partner' AND user_has_tracker_access(cases.service_tracker_id))
      )
    )
  );

CREATE POLICY "Users can upload documents to accessible cases"
  ON case_documents FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS(
      SELECT 1 FROM cases
      WHERE cases.id = case_documents.case_id
      AND (
        get_user_role() = 'portal_admin' OR
        get_user_role() IN ('internal_manager', 'internal_user') OR
        (get_user_role() = 'service_partner' AND user_has_tracker_access(cases.service_tracker_id))
      )
    )
  );

-- =============================================
-- NOTIFICATIONS: Users see own notifications
-- =============================================

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
-- =============================================
-- Seed Data for Development
-- =============================================

-- =============================================
-- 1. REGIONS (11 EMEA countries)
-- =============================================

INSERT INTO regions (name, code) VALUES
  ('France', 'FR'),
  ('Germany', 'DE'),
  ('Italy', 'IT'),
  ('Spain', 'ES'),
  ('Switzerland', 'CH'),
  ('United Kingdom', 'UK'),
  ('Austria', 'AT'),
  ('Czech Republic', 'CZ'),
  ('Poland', 'PL'),
  ('Belgium', 'BE'),
  ('Luxembourg', 'LU')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 2. SERVICE TRACKERS (one per region)
-- =============================================

INSERT INTO service_trackers (name, region_id)
SELECT
  'TwoService-' || name,
  id
FROM regions
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 3. USERS (via auth.users + profiles)
-- Note: This requires manual user creation via Supabase Auth
-- For now, we'll create profile entries that will link once users are created
-- =============================================

-- The following users need to be created in Supabase Auth Dashboard:
-- 1. admin@evident.com - Portal Admin
-- 2. user@evident.com - Internal User
-- 3. manager@evident.com - Internal Manager
-- Password for all: Password123!

-- Profiles will be inserted after auth.users are created
-- Placeholder comment for manual step

-- =============================================
-- 4. FIELD DEFINITIONS (dynamic fields)
-- =============================================

-- Customer Section
INSERT INTO field_definitions (key, label, data_type, section, visible_to_roles, sort_order) VALUES
  ('customer_name', 'Customer Name', 'text', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 1),
  ('customer_number', 'Customer Number', 'text', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 2),
  ('customer_contact_person', 'Contact Person', 'text', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 3),
  ('customer_phone', 'Phone', 'text', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 4),
  ('customer_email', 'Email', 'text', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 5),
  ('customer_address', 'Address', 'textarea', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 6),
  ('customer_language', 'Language', 'select', 'customer', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 7)
ON CONFLICT (key) DO NOTHING;

-- Update language field with options
UPDATE field_definitions
SET options = '["EN", "FR", "DE", "IT", "ES", "PL", "CZ"]'::jsonb
WHERE key = 'customer_language';

-- Device Section
INSERT INTO field_definitions (key, label, data_type, section, visible_to_roles, sort_order) VALUES
  ('device', 'Device(s)', 'text', 'device', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 1),
  ('serial_number', 'Serial Number(s)', 'text', 'device', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 2),
  ('camera_included', 'Camera Included', 'boolean', 'device', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 3),
  ('software_included', 'Software Included', 'boolean', 'device', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 4),
  ('customer_fault_description', 'Customer Fault Description', 'textarea', 'device', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 5)
ON CONFLICT (key) DO NOTHING;

-- Service Section
INSERT INTO field_definitions (key, label, data_type, section, visible_to_roles, sort_order) VALUES
  ('sp_admin', 'SP Admin', 'text', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 1),
  ('sp_engineer', 'SP Engineer', 'text', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 2),
  ('labour_hours', 'Labour Hours', 'number', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user'], 3),
  ('spare_parts', 'Spare Parts', 'textarea', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user'], 4),
  ('sp_comments', 'SP Comments', 'textarea', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 5),
  ('cuca_agent', 'CuCa Agent', 'text', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user'], 6),
  ('access_registration_required', 'Access Registration Required', 'select', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 7),
  ('frame_qty', 'Frame Quantity', 'number', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 8),
  ('visits_qty', 'Visits Quantity', 'number', 'service', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 9)
ON CONFLICT (key) DO NOTHING;

-- Update access_registration_required options
UPDATE field_definitions
SET options = '["Yes", "No"]'::jsonb
WHERE key = 'access_registration_required';

-- Dates Section
INSERT INTO field_definitions (key, label, data_type, section, visible_to_roles, sort_order) VALUES
  ('request_date', 'Request Date', 'date', 'dates', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 1),
  ('customer_contacted_date', 'Customer Contacted Date', 'date', 'dates', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 2),
  ('scheduled_date', 'Scheduled Date', 'date', 'dates', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 3),
  ('completion_date', 'Completion Date', 'date', 'dates', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 4)
ON CONFLICT (key) DO NOTHING;

-- Additional Section
INSERT INTO field_definitions (key, label, data_type, section, visible_to_roles, sort_order) VALUES
  ('additional_information', 'Additional Information', 'textarea', 'additional', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 1),
  ('complaint', 'Complaint', 'boolean', 'additional', ARRAY['portal_admin', 'internal_manager', 'internal_user'], 2),
  ('product_complaint_description', 'Product Complaint Description', 'textarea', 'additional', ARRAY['portal_admin', 'internal_manager', 'internal_user'], 3),
  ('customer_complaint_description', 'Customer Complaint Description', 'textarea', 'additional', ARRAY['portal_admin', 'internal_manager', 'internal_user', 'service_partner'], 4)
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 5. SAMPLE CASES (from CSV - TwoService-France)
-- Note: created_by will need to be updated after users are created
-- Using a placeholder system user for now
-- =============================================

-- We'll insert sample cases after user creation in a separate step
-- For now, this completes the schema and base reference data
