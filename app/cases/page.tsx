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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return null; // Middleware will redirect to sign-in
  }

  // Await searchParams (Next.js 15 requirement)
  const params = await searchParams;

  // Parse search params for filters
  const status = params.status
    ? Array.isArray(params.status)
      ? params.status
      : [params.status]
    : undefined;

  const search = typeof params.search === 'string' ? params.search : undefined;
  const regionId = typeof params.region === 'string' ? params.region : undefined;
  const trackerId = typeof params.tracker === 'string' ? params.tracker : undefined;

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
