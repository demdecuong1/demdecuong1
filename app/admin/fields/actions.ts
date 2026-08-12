'use server';

/**
 * Server Actions for Field Definitions Management
 * All actions require portal_admin role
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import {
  createFieldDefinition,
  updateFieldDefinition,
  deprecateFieldDefinition,
  validateFieldDefinition,
  type FieldDefinitionInput,
} from '@/lib/data/admin/fields';

export interface ActionResult {
  success: boolean;
  message?: string;
  errors?: string[];
  fieldId?: string;
}

/**
 * Create a new field definition
 */
export async function createFieldAction(formData: FormData): Promise<ActionResult> {
  try {
    // Require portal_admin role
    const user = await requireRole('portal_admin');

    // Parse form data
    const key = formData.get('key') as string;
    const label = formData.get('label') as string;
    const data_type = formData.get('data_type') as any;
    const section = formData.get('section') as any;
    const required = formData.get('required') === 'true';
    const sort_order = parseInt(formData.get('sort_order') as string);

    // Parse visible_to_roles (checkboxes)
    const visible_to_roles: string[] = [];
    if (formData.get('role_portal_admin')) visible_to_roles.push('portal_admin');
    if (formData.get('role_internal_manager')) visible_to_roles.push('internal_manager');
    if (formData.get('role_internal_user')) visible_to_roles.push('internal_user');
    if (formData.get('role_service_partner')) visible_to_roles.push('service_partner');

    // Parse options (for select type)
    const optionsStr = formData.get('options') as string;
    const options = optionsStr ? optionsStr.split('\n').map(o => o.trim()).filter(Boolean) : null;

    const fieldData: FieldDefinitionInput = {
      key,
      label,
      data_type,
      section,
      visible_to_roles,
      required,
      options,
      sort_order,
    };

    // Validate
    const validation = validateFieldDefinition(fieldData);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Create field
    const field = await createFieldDefinition(user.id, fieldData);

    // Revalidate
    revalidatePath('/admin/fields');

    return {
      success: true,
      message: 'Field created successfully',
      fieldId: field.id,
    };
  } catch (error: any) {
    console.error('Error creating field:', error);
    return {
      success: false,
      message: error.message || 'Failed to create field',
    };
  }
}

/**
 * Update an existing field definition
 */
export async function updateFieldAction(fieldId: string, formData: FormData): Promise<ActionResult> {
  try {
    // Require portal_admin role
    const user = await requireRole('portal_admin');

    // Parse form data (same as create, but key is immutable)
    const label = formData.get('label') as string;
    const data_type = formData.get('data_type') as any;
    const section = formData.get('section') as any;
    const required = formData.get('required') === 'true';
    const sort_order = parseInt(formData.get('sort_order') as string);

    const visible_to_roles: string[] = [];
    if (formData.get('role_portal_admin')) visible_to_roles.push('portal_admin');
    if (formData.get('role_internal_manager')) visible_to_roles.push('internal_manager');
    if (formData.get('role_internal_user')) visible_to_roles.push('internal_user');
    if (formData.get('role_service_partner')) visible_to_roles.push('service_partner');

    const optionsStr = formData.get('options') as string;
    const options = optionsStr ? optionsStr.split('\n').map(o => o.trim()).filter(Boolean) : null;

    const updates = {
      label,
      data_type,
      section,
      visible_to_roles,
      required,
      options,
      sort_order,
    };

    // Update field
    await updateFieldDefinition(user.id, fieldId, updates);

    // Revalidate
    revalidatePath('/admin/fields');
    revalidatePath(`/admin/fields/${fieldId}`);

    return {
      success: true,
      message: 'Field updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating field:', error);
    return {
      success: false,
      message: error.message || 'Failed to update field',
    };
  }
}

/**
 * Deprecate a field definition
 */
export async function deprecateFieldAction(fieldId: string): Promise<ActionResult> {
  try {
    // Require portal_admin role
    const user = await requireRole('portal_admin');

    // Deprecate field
    await deprecateFieldDefinition(user.id, fieldId);

    // Revalidate
    revalidatePath('/admin/fields');
    revalidatePath(`/admin/fields/${fieldId}`);

    return {
      success: true,
      message: 'Field deprecated successfully',
    };
  } catch (error: any) {
    console.error('Error deprecating field:', error);
    return {
      success: false,
      message: error.message || 'Failed to deprecate field',
    };
  }
}
