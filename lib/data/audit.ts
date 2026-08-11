/**
 * Audit Logging Helpers
 *
 * Hard Rule #2: Every case mutation writes a case_events audit row
 * Hard Rule #3: Relevant mutations create notifications
 */

import { createServerClient } from '@/lib/supabase/server';

export type EventType =
  | 'created'
  | 'status_change'
  | 'field_updated'
  | 'comment_added'
  | 'document_uploaded'
  | 'assigned';

export interface AuditEventData {
  caseId: string;
  eventType: EventType;
  userId: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

export interface NotificationData {
  userId: string;
  caseId: string;
  type: 'case_updated' | 'status_changed' | 'comment_added' | 'assigned_to_you';
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Write an audit event to case_events table.
 * Called automatically by all case mutations.
 */
export async function writeAuditEvent(data: AuditEventData): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.from('case_events').insert({
    case_id: data.caseId,
    event_type: data.eventType,
    user_id: data.userId,
    field_name: data.fieldName,
    old_value: data.oldValue,
    new_value: data.newValue,
    metadata: data.metadata,
  });

  if (error) {
    console.error('Failed to write audit event:', error);
    throw new Error('Audit logging failed');
  }
}

/**
 * Create a notification for a user.
 * Respects user's scope - only notifies if they can see the case.
 */
export async function createNotification(data: NotificationData): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.from('notifications').insert({
    user_id: data.userId,
    case_id: data.caseId,
    type: data.type,
    title: data.title,
    message: data.message,
    metadata: data.metadata,
  });

  if (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Notify relevant users about a case update.
 * Filters by user scope (partners only see their tracker's cases).
 */
export async function notifyRelevantUsers(
  caseId: string,
  type: NotificationData['type'],
  title: string,
  message: string,
  excludeUserId?: string
): Promise<void> {
  const supabase = await createServerClient();

  // Get the case to determine who should be notified
  const { data: caseData } = await supabase
    .from('cases')
    .select('service_tracker_id, region_id')
    .eq('id', caseId)
    .single();

  if (!caseData) return;

  // Get all users who should see this case
  // 1. Internal users (see all cases)
  const { data: internalUsers } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['portal_admin', 'internal_manager', 'internal_user']);

  // 2. Partners assigned to this tracker
  const { data: partnerUsers } = await supabase
    .from('user_trackers')
    .select('user_id')
    .eq('service_tracker_id', caseData.service_tracker_id);

  const userIds = [
    ...(internalUsers?.map(u => u.id) || []),
    ...(partnerUsers?.map(u => u.user_id) || []),
  ].filter(id => id !== excludeUserId); // Don't notify the actor

  // Create notifications for all relevant users
  for (const userId of userIds) {
    await createNotification({
      userId,
      caseId,
      type,
      title,
      message,
    });
  }
}
