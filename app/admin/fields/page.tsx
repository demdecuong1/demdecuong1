import { Box, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import FieldsList from './FieldsList';
import { getCurrentUser } from '@/lib/auth';
import { getAllFieldDefinitions } from '@/lib/data/admin/fields';

/**
 * Admin: Field Definitions List
 * Shows all field definitions with ability to add/edit/deprecate
 */
export default async function AdminFieldsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const fields = await getAllFieldDefinitions();

  return (
    <AppShell user={user.profile}>
      <Box>
        <PageHeader
          title="Field Definitions"
          count={fields.length}
          actions={
            <Button
              component={Link}
              href="/admin/fields/new"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Add field
            </Button>
          }
        />

        <Box sx={{ mb: 2 }}>
          <Chip
            label={`${fields.filter(f => f.visible_to_roles.length > 0).length} Active`}
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={`${fields.filter(f => f.visible_to_roles.length === 0).length} Deprecated`}
            size="small"
            variant="outlined"
          />
        </Box>

        <FieldsList fields={fields} />
      </Box>
    </AppShell>
  );
}
