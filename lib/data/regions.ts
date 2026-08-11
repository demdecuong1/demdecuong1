/**
 * Regions Data Access Layer
 */

import { createClient } from '@/lib/supabase/server';
import { getUserScope, UserRole } from '@/lib/auth';

export interface Region {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

/**
 * Get all regions accessible to the current user.
 * Internal users see all; partners see only their assigned regions.
 */
export async function getAccessibleRegions(userId: string, role: UserRole): Promise<Region[]> {
  const supabase = await createClient();

  if (role === 'portal_admin' || role === 'internal_manager' || role === 'internal_user') {
    // Internal users see all regions
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Failed to fetch regions:', error);
      throw error;
    }

    return data || [];
  }

  // Service partners: only their assigned regions
  const scope = await getUserScope(userId, role);

  if (scope.regions.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .in('id', scope.regions)
    .order('name');

  if (error) {
    console.error('Failed to fetch regions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single region by ID.
 */
export async function getRegionById(regionId: string): Promise<Region | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('id', regionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Failed to fetch region:', error);
    throw error;
  }

  return data;
}
