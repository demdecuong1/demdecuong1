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
