/**
 * Admin: Field Definitions Data Access Layer
 *
 * CRUD operations for managing dynamic field definitions.
 * Only accessible to portal_admin.
 */

import { createClient } from '@/lib/supabase/server';
import type { FieldDefinition, FieldDataType, FieldSection } from '@/lib/data/fieldDefinitions';

export interface FieldDefinitionInput {
  key: string;
  label: string;
  data_type: FieldDataType;
  section: FieldSection;
  visible_to_roles: string[];
  required?: boolean;
  options?: string[] | null;
  sort_order: number;
}

/**
 * Get all field definitions (including deprecated) - Admin view
 */
export async function getAllFieldDefinitions(): Promise<FieldDefinition[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('field_definitions')
    .select('*')
    .order('section')
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch field definitions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single field definition by ID
 */
export async function getFieldDefinitionById(id: string): Promise<FieldDefinition | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('field_definitions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Failed to fetch field definition:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new field definition
 * Returns the created field or throws validation error
 */
export async function createFieldDefinition(
  userId: string,
  fieldData: FieldDefinitionInput
): Promise<FieldDefinition> {
  const supabase = await createClient();

  // Validate key uniqueness
  const { data: existing } = await supabase
    .from('field_definitions')
    .select('id')
    .eq('key', fieldData.key)
    .single();

  if (existing) {
    throw new Error(`Field with key "${fieldData.key}" already exists`);
  }

  // Validate key format (kebab-case)
  if (!/^[a-z][a-z0-9_]*$/.test(fieldData.key)) {
    throw new Error('Field key must be lowercase letters, numbers, and underscores only');
  }

  // Create field
  const { data, error } = await supabase
    .from('field_definitions')
    .insert({
      ...fieldData,
      required: fieldData.required || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create field definition:', error);
    throw error;
  }

  // TODO: Write audit event for field creation

  return data;
}

/**
 * Update an existing field definition
 * Key cannot be changed after creation
 */
export async function updateFieldDefinition(
  userId: string,
  fieldId: string,
  updates: Partial<FieldDefinitionInput>
): Promise<FieldDefinition> {
  const supabase = await createClient();

  // Don't allow key updates
  const { key, ...allowedUpdates } = updates;

  const { data, error } = await supabase
    .from('field_definitions')
    .update(allowedUpdates)
    .eq('id', fieldId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update field definition:', error);
    throw error;
  }

  // TODO: Write audit event for field update

  return data;
}

/**
 * Deprecate a field definition (soft delete)
 * Sets a deprecated flag but keeps the field in the database
 */
export async function deprecateFieldDefinition(
  userId: string,
  fieldId: string
): Promise<void> {
  const supabase = await createClient();

  // Note: We'd need to add a 'deprecated' column to field_definitions table
  // For now, we can use a special role visibility to "hide" it
  const { error } = await supabase
    .from('field_definitions')
    .update({
      visible_to_roles: [], // Empty array = hidden from all
    })
    .eq('id', fieldId);

  if (error) {
    console.error('Failed to deprecate field definition:', error);
    throw error;
  }

  // TODO: Write audit event for field deprecation
}

/**
 * Count how many cases have this field populated
 */
export async function getFieldUsageCount(fieldKey: string): Promise<number> {
  const supabase = await createClient();

  // Count cases where the field exists in the JSONB data column
  const { count, error } = await supabase
    .from('cases')
    .select('id', { count: 'exact', head: true })
    .not('data->' + fieldKey, 'is', null);

  if (error) {
    console.error('Failed to count field usage:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Validate field definition data
 */
export function validateFieldDefinition(field: FieldDefinitionInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Key validation
  if (!field.key) {
    errors.push('Field key is required');
  } else if (!/^[a-z][a-z0-9_]*$/.test(field.key)) {
    errors.push('Field key must be lowercase letters, numbers, and underscores only');
  }

  // Label validation
  if (!field.label || field.label.trim().length === 0) {
    errors.push('Field label is required');
  }

  // Data type validation
  const validDataTypes: FieldDataType[] = ['text', 'textarea', 'number', 'date', 'boolean', 'select'];
  if (!validDataTypes.includes(field.data_type)) {
    errors.push('Invalid data type');
  }

  // Section validation
  const validSections: FieldSection[] = ['customer', 'device', 'service', 'dates', 'additional'];
  if (!validSections.includes(field.section)) {
    errors.push('Invalid section');
  }

  // Roles validation
  if (!field.visible_to_roles || field.visible_to_roles.length === 0) {
    errors.push('At least one role must be selected');
  }

  // Options validation for select type
  if (field.data_type === 'select' && (!field.options || field.options.length === 0)) {
    errors.push('Select fields must have at least one option');
  }

  // Sort order validation
  if (field.sort_order < 0) {
    errors.push('Sort order must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
