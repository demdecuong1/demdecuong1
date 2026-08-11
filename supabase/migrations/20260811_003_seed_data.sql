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
