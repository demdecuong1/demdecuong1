import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import FieldForm from '../FieldForm';
import { getCurrentUser } from '@/lib/auth';

/**
 * Create New Field Definition
 */
export default async function NewFieldPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <AppShell user={user.profile}>
      <PageHeader title="Add Field Definition" />
      <FieldForm mode="create" />
    </AppShell>
  );
}
