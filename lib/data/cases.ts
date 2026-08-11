/**
 * Cases Data Access Layer
 *
 * Hard Rule #1: Every query is scope-filtered (partners see only their tracker's cases)
 * Hard Rule #2: Every mutation writes to case_events
 * Hard Rule #3: Relevant mutations create notifications
 */

import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent, notifyRelevantUsers } from './audit';

export type CaseStatus = 'open' | 'in_progress' | 'scheduled' | 'on_hold' | 'completed' | 'cancelled';
export type CasePriority = 'normal' | 'high';

export interface CaseFilters {
  status?: CaseStatus | CaseStatus[];
  priority?: CasePriority;
  regionId?: string;
  trackerId?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface Case {
  id: string;
  case_number: number;
  service_order: string | null;
  job_type: string | null;
  status: CaseStatus;
  priority: CasePriority;
  region_id: string;
  service_tracker_id: string;
  data: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  regions?: { name: string; code: string };
  service_trackers?: { name: string };
  profiles?: { full_name: string };
}

/**
 * Get cases accessible to the current user.
 * Automatically scoped by RLS policies.
 */
export async function getCases(filters: CaseFilters = {}): Promise<{ data: Case[]; count: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('cases')
    .select(`
      *,
      regions(name, code),
      service_trackers(name),
      profiles:created_by(full_name)
    `, { count: 'exact' })
    .order('updated_at', { ascending: false });

  // Apply filters
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters.regionId) {
    query = query.eq('region_id', filters.regionId);
  }

  if (filters.trackerId) {
    query = query.eq('service_tracker_id', filters.trackerId);
  }

  if (filters.searchQuery) {
    // Search in case_number, service_order, job_type, and JSONB data
    query = query.or(`
      case_number::text.ilike.%${filters.searchQuery}%,
      service_order.ilike.%${filters.searchQuery}%,
      job_type.ilike.%${filters.searchQuery}%,
      data->>customer_name.ilike.%${filters.searchQuery}%
    `);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 25) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Failed to fetch cases:', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
  };
}

/**
 * Get a single case by ID.
 * RLS automatically enforces scope.
 */
export async function getCaseById(caseId: string): Promise<Case | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      regions(name, code),
      service_trackers(name),
      profiles:created_by(full_name)
    `)
    .eq('id', caseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found or no access
      return null;
    }
    console.error('Failed to fetch case:', error);
    throw error;
  }

  return data;
}

/**
 * Update a case and write audit event.
 * Hard Rule #2: Every mutation writes to case_events.
 * Hard Rule #3: Status changes trigger notifications.
 */
export async function updateCase(
  userId: string,
  caseId: string,
  updates: {
    status?: CaseStatus;
    priority?: CasePriority;
    job_type?: string;
    service_order?: string;
    data?: Record<string, any>;
  }
): Promise<Case> {
  const supabase = await createClient();

  // Get current state for audit trail
  const { data: currentCase } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (!currentCase) {
    throw new Error('Case not found or access denied');
  }

  // Update the case
  const { data: updatedCase, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId)
    .select(`
      *,
      regions(name, code),
      service_trackers(name),
      profiles:created_by(full_name)
    `)
    .single();

  if (error) {
    console.error('Failed to update case:', error);
    throw error;
  }

  // Write audit events for each changed field
  const changedFields = Object.keys(updates) as Array<keyof typeof updates>;

  for (const field of changedFields) {
    const oldValue = field === 'data' ? JSON.stringify(currentCase[field]) : String(currentCase[field] || '');
    const newValue = field === 'data' ? JSON.stringify(updates[field]) : String(updates[field] || '');

    if (oldValue !== newValue) {
      await writeAuditEvent({
        caseId,
        eventType: field === 'status' ? 'status_change' : 'field_updated',
        userId,
        fieldName: field,
        oldValue,
        newValue,
      });

      // Status changes trigger notifications
      if (field === 'status') {
        await notifyRelevantUsers(
          caseId,
          'status_changed',
          `Case #${currentCase.case_number} status changed`,
          `Status changed from ${oldValue} to ${newValue}`,
          userId // Don't notify the user who made the change
        );
      }
    }
  }

  return updatedCase;
}

/**
 * Create a new case.
 */
export async function createCase(
  userId: string,
  caseData: {
    case_number: number;
    service_order?: string;
    job_type?: string;
    status: CaseStatus;
    priority: CasePriority;
    region_id: string;
    service_tracker_id: string;
    data?: Record<string, any>;
  }
): Promise<Case> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      ...caseData,
      created_by: userId,
    })
    .select(`
      *,
      regions(name, code),
      service_trackers(name),
      profiles:created_by(full_name)
    `)
    .single();

  if (error) {
    console.error('Failed to create case:', error);
    throw error;
  }

  // Write audit event
  await writeAuditEvent({
    caseId: data.id,
    eventType: 'created',
    userId,
    fieldName: 'case',
    newValue: String(data.case_number),
    metadata: {
      job_type: data.job_type,
      status: data.status,
    },
  });

  return data;
}

/**
 * Mark a case as viewed by the current user.
 * Updates case_views.last_seen_at for change awareness.
 */
export async function markCaseAsViewed(userId: string, caseId: string): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('case_views')
    .upsert({
      user_id: userId,
      case_id: caseId,
      last_seen_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,case_id',
    });
}
