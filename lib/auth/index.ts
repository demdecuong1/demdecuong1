/**
 * Authentication & Authorization Layer
 *
 * Provides:
 * - getCurrentUser() - Get authenticated user + profile
 * - requireAuth() - Server-side auth guard
 * - requireRole() - Role-based access control
 * - getUserScope() - Get user's accessible regions/trackers
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'portal_admin' | 'internal_manager' | 'internal_user' | 'service_partner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserScope {
  regions: string[]; // region IDs
  trackers: string[]; // service_tracker IDs
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: UserProfile;
  scope: UserScope;
}

/**
 * Get the current authenticated user with profile and scope.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // Get user scope (regions/trackers they can access)
  const scope = await getUserScope(user.id, profile.role);

  return {
    id: user.id,
    email: user.email!,
    profile,
    scope,
  };
}

/**
 * Get the scope (regions/trackers) accessible to a user.
 *
 * Rules:
 * - portal_admin: all regions/trackers
 * - internal_manager: all regions/trackers
 * - internal_user: all regions/trackers
 * - service_partner: only their assigned tracker(s)
 */
export async function getUserScope(userId: string, role: UserRole): Promise<UserScope> {
  const supabase = await createClient();

  if (role === 'portal_admin' || role === 'internal_manager' || role === 'internal_user') {
    // Internal users see everything
    const { data: regions } = await supabase
      .from('regions')
      .select('id');

    const { data: trackers } = await supabase
      .from('service_trackers')
      .select('id');

    return {
      regions: regions?.map(r => r.id) || [],
      trackers: trackers?.map(t => t.id) || [],
    };
  }

  // Service partners: only their assigned trackers
  const { data: userTrackers } = await supabase
    .from('user_trackers')
    .select('service_tracker_id, service_trackers(region_id)')
    .eq('user_id', userId);

  const trackerIds = userTrackers?.map(ut => ut.service_tracker_id) || [];
  const regionIds = userTrackers?.map(ut => (ut.service_trackers as any)?.region_id).filter(Boolean) || [];

  return {
    regions: [...new Set(regionIds)],
    trackers: trackerIds,
  };
}

/**
 * Require authentication. Redirects to sign-in if not authenticated.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

/**
 * Require a specific role. Throws error if user doesn't have required role.
 */
export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.profile.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

/**
 * Check if a user can access a specific case.
 * Used for detail pages and mutations.
 */
export async function canAccessCase(userId: string, caseId: string): Promise<boolean> {
  const supabase = await createClient();

  // Let RLS handle this - try to fetch the case
  // If RLS blocks it, we get null
  const { data } = await supabase
    .from('cases')
    .select('id')
    .eq('id', caseId)
    .single();

  return !!data;
}
