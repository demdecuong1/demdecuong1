-- =============================================
-- Import Sample Cases from CSV
-- Run this AFTER users are created
-- Replace <ADMIN_USER_ID> with the actual admin user ID
-- =============================================

-- First, let's create a few sample cases from the TwoService-France CSV data
-- We'll use the admin user as created_by for now

-- Get France region and TwoService-France tracker IDs
DO $$
DECLARE
  france_region_id UUID;
  france_tracker_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get region ID for France
  SELECT id INTO france_region_id FROM regions WHERE code = 'FR';

  -- Get tracker ID for TwoService-France
  SELECT id INTO france_tracker_id FROM service_trackers WHERE name = 'TwoService-France';

  -- Get admin user ID (you'll need to update this after creating the admin user)
  -- For now, we'll use the first admin profile
  SELECT id INTO admin_user_id FROM profiles WHERE role = 'portal_admin' LIMIT 1;

  IF france_region_id IS NULL OR france_tracker_id IS NULL OR admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing required data. Ensure regions, trackers, and admin user exist.';
  END IF;

  -- Insert sample cases (from CSV rows 1-20)
  INSERT INTO cases (case_number, service_order, job_type, status, priority, region_id, service_tracker_id, created_by, data) VALUES
    (32, '6408', 'Maintenance Contract', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Emma Johnson", "customer_number": "29", "customer_language": "FR"}'),

    (34, '8681', 'Maintenance Contract', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Liam Williams", "customer_number": "17", "customer_language": "FR"}'),

    (67, '3639', 'Maintenance Contract', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Olivia Brown", "customer_number": "88", "customer_language": "FR"}'),

    (734, '2212', 'Camera/SW Update', 'in_progress', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Noah Jones", "customer_number": "69", "customer_language": "FR", "access_registration_required": "No"}'),

    (136, '2168', 'Maintenance Contract', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Ava Garcia", "customer_number": "67", "customer_language": "FR"}'),

    (214, '4958', 'Maintenance Contract', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Ethan Miller", "customer_number": "76", "customer_language": "FR"}'),

    (448, '2200', 'Preventive Maintenance', 'on_hold', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Sophia Davis", "customer_number": "73", "customer_language": "FR"}'),

    (745, '8800', 'Maintenance Contract', 'in_progress', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Mason Rodriguez", "customer_number": "85", "customer_language": "FR"}'),

    (281, '6161', 'Preventive Maintenance', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Isabella Martinez", "customer_number": "2", "customer_language": "FR"}'),

    (147, '4726', 'Installation', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Lucas Hernandez", "customer_number": "86", "customer_language": "FR"}'),

    (1000, '6636', 'Camera/SW Update', 'cancelled', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Mia Lopez", "customer_number": "24", "customer_language": "FR", "access_registration_required": "No"}'),

    (267, '8396', 'Camera/SW Update', 'scheduled', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Benjamin Gonzalez", "customer_number": "5", "customer_language": "FR", "access_registration_required": "No"}'),

    (550, '620', 'Installation', 'on_hold', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Charlotte Wilson", "customer_number": "36", "customer_language": "FR", "access_registration_required": "No"}'),

    (867, '904', 'Maintenance Contract', 'on_hold', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "James Anderson", "customer_number": "92", "customer_language": "FR"}'),

    (766, '7641', 'Preventive Maintenance', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Amelia Thomas", "customer_number": "100", "customer_language": "FR"}'),

    (770, '3191', 'Installation', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Elijah Taylor", "customer_number": "27", "customer_language": "FR"}'),

    (380, '3288', 'Camera/SW Update', 'completed', 'high', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Harper Moore", "customer_number": "12", "customer_language": "FR"}'),

    (669, '6364', 'Preventive Maintenance', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Henry Jackson", "customer_number": "10", "customer_language": "FR"}'),

    (418, '5829', 'Installation', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Evelyn Martin", "customer_number": "87", "customer_language": "FR", "access_registration_required": "No"}'),

    (93, '5115', 'Camera/SW Update', 'completed', 'normal', france_region_id, france_tracker_id, admin_user_id,
     '{"customer_name": "Alexander Lee", "customer_number": "97", "customer_language": "FR", "access_registration_required": "No"}');

  -- Create initial case events for these cases
  INSERT INTO case_events (case_id, event_type, user_id, field_name, new_value, metadata)
  SELECT
    id,
    'created',
    admin_user_id,
    'case',
    case_number::text,
    jsonb_build_object('job_type', job_type, 'status', status)
  FROM cases;

  RAISE NOTICE 'Successfully imported % cases', (SELECT COUNT(*) FROM cases);
END $$;
