import { Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import CaseList from './CaseList';
import { getCurrentUser } from '@/lib/auth';
import { getCases } from '@/lib/data/cases';

/**
 * Cases list page
 * Displays all cases accessible to the current user with filters
 */
export default async function CasesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null; // Middleware will redirect to sign-in
  }

  // Parse search params for filters
  const status = searchParams.status
    ? Array.isArray(searchParams.status)
      ? searchParams.status
      : [searchParams.status]
    : undefined;

  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const regionId = typeof searchParams.region === 'string' ? searchParams.region : undefined;
  const trackerId = typeof searchParams.tracker === 'string' ? searchParams.tracker : undefined;

  // Fetch cases with filters
  const { data: cases, count } = await getCases({
    status: status as any,
    regionId,
    trackerId,
    searchQuery: search,
  });

  return (
    <AppShell user={user.profile}>
      <Box>
        <PageHeader
          title="Cases"
          count={count}
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled // TODO: Implement create case
            >
              Create case
            </Button>
          }
        />

        <CaseList cases={cases} totalCount={count} userRole={user.profile.role} />
      </Box>
    </AppShell>
  );
}
