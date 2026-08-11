/**
 * Service Trackers Data Access Layer
 */

import { createServerClient } from '@/lib/supabase/server';
import { getUserScope, UserRole } from '@/lib/auth';

export interface ServiceTracker {
  id: string;
  name: string;
  region_id: string;
  created_at: string;
  regions?: { name: string; code: string };
}

/**
 * Get all service trackers accessible to the current user.
 * Internal users see all; partners see only their assigned trackers.
 */
export async function getAccessibleTrackers(userId: string, role: UserRole): Promise<ServiceTracker[]> {
  const supabase = await createServerClient();

  if (role === 'portal_admin' || role === 'internal_manager' || role === 'internal_user') {
    // Internal users see all trackers
    const { data, error } = await supabase
      .from('service_trackers')
      .select('*, regions(name, code)')
      .order('name');

    if (error) {
      console.error('Failed to fetch trackers:', error);
      throw error;
    }

    return data || [];
  }

  // Service partners: only their assigned trackers
  const scope = await getUserScope(userId, role);

  if (scope.trackers.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('service_trackers')
    .select('*, regions(name, code)')
    .in('id', scope.trackers)
    .order('name');

  if (error) {
    console.error('Failed to fetch trackers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get trackers for a specific region.
 */
export async function getTrackersByRegion(userId: string, role: UserRole, regionId: string): Promise<ServiceTracker[]> {
  const supabase = await createServerClient();

  const scope = await getUserScope(userId, role);

  let query = supabase
    .from('service_trackers')
    .select('*, regions(name, code)')
    .eq('region_id', regionId)
    .order('name');

  // Apply scope filter for partners
  if (role === 'service_partner' && scope.trackers.length > 0) {
    query = query.in('id', scope.trackers);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch trackers:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single tracker by ID.
 */
export async function getTrackerById(trackerId: string): Promise<ServiceTracker | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('service_trackers')
    .select('*, regions(name, code)')
    .eq('id', trackerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Failed to fetch tracker:', error);
    throw error;
  }

  return data;
}
