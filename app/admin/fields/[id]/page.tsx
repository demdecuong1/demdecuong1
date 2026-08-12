import { notFound } from 'next/navigation';
import { Box, Button, Alert } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import FieldForm from '../FieldForm';
import DeprecateButton from './DeprecateButton';
import { getCurrentUser } from '@/lib/auth';
import { getFieldDefinitionById, getFieldUsageCount } from '@/lib/data/admin/fields';

/**
 * Edit Field Definition
 */
export default async function EditFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { id } = await params;
  const field = await getFieldDefinitionById(id);

  if (!field) {
    notFound();
  }

  const usageCount = await getFieldUsageCount(field.key);
  const isDeprecated = field.visible_to_roles.length === 0;

  return (
    <AppShell user={user.profile}>
      <Box>
        <PageHeader
          title={`Edit Field: ${field.label}`}
          actions={
            !isDeprecated && (
              <DeprecateButton fieldId={field.id} fieldKey={field.key} usageCount={usageCount} />
            )
          }
        />

        {isDeprecated && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This field has been deprecated and is no longer visible to any roles.
          </Alert>
        )}

        {usageCount > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This field is used in <strong>{usageCount}</strong> case{usageCount !== 1 ? 's' : ''}.
            Deprecating it will hide the field from forms, but existing data will be preserved.
          </Alert>
        )}

        <FieldForm mode="edit" field={field} />
      </Box>
    </AppShell>
  );
}
