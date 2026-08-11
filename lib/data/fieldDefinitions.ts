/**
 * Field Definitions Data Access Layer
 *
 * Hard Rule #4: Dynamic fields are metadata-driven.
 * Hard Rule #5: Per-field visibility is applied server-side.
 */

import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/lib/auth';

export type FieldDataType = 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select';
export type FieldSection = 'customer' | 'device' | 'service' | 'dates' | 'additional';

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  data_type: FieldDataType;
  section: FieldSection;
  visible_to_roles: UserRole[];
  required: boolean;
  options?: string[] | null;
  sort_order: number;
  created_at: string;
}

/**
 * Get all field definitions visible to the current user's role.
 * Hard Rule #5: Per-field visibility is applied server-side.
 */
export async function getFieldDefinitions(role: UserRole): Promise<FieldDefinition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('field_definitions')
    .select('*')
    .contains('visible_to_roles', [role])
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch field definitions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get field definitions grouped by section.
 */
export async function getFieldDefinitionsBySection(
  role: UserRole
): Promise<Record<FieldSection, FieldDefinition[]>> {
  const fields = await getFieldDefinitions(role);

  const grouped: Record<FieldSection, FieldDefinition[]> = {
    customer: [],
    device: [],
    service: [],
    dates: [],
    additional: [],
  };

  for (const field of fields) {
    grouped[field.section].push(field);
  }

  return grouped;
}

/**
 * Check if a field is visible to a given role.
 */
export function isFieldVisibleToRole(field: FieldDefinition, role: UserRole): boolean {
  return field.visible_to_roles.includes(role);
}

/**
 * Filter case data to only include fields visible to the user's role.
 * Hard Rule #5: Per-field visibility is applied server-side.
 */
export async function filterCaseDataByRole(
  caseData: Record<string, any>,
  role: UserRole
): Promise<Record<string, any>> {
  const visibleFields = await getFieldDefinitions(role);
  const visibleKeys = new Set(visibleFields.map(f => f.key));

  const filtered: Record<string, any> = {};

  for (const [key, value] of Object.entries(caseData)) {
    if (visibleKeys.has(key)) {
      filtered[key] = value;
    }
  }

  return filtered;
}
