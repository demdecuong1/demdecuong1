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
