import { notFound } from 'next/navigation';
import { Box, Paper, Typography, Stack } from '@mui/material';
import AppShell from '@/components/AppShell';
import StatusChip from '@/components/StatusChip';
import SectionCard from '@/components/SectionCard';
import FieldDisplay from '@/components/FieldDisplay';
import CaseDetailTabs from './CaseDetailTabs';
import { getCurrentUser } from '@/lib/auth';
import { getCaseById, markCaseAsViewed } from '@/lib/data/cases';
import { getFieldDefinitionsBySection } from '@/lib/data/fieldDefinitions';

/**
 * Case detail page
 * Displays case information with dynamic fields grouped by section
 */
export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    return null; // Middleware will redirect
  }

  const caseData = await getCaseById(params.id);

  if (!caseData) {
    notFound();
  }

  // Mark case as viewed for change awareness
  await markCaseAsViewed(user.id, params.id);

  // Get field definitions grouped by section
  const fieldsBySection = await getFieldDefinitionsBySection(user.profile.role);

  return (
    <AppShell user={user.profile}>
      <Box>
        {/* Sticky header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            position: 'sticky',
            top: 64, // AppBar height
            zIndex: 10,
            backgroundColor: 'background.paper',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
              >
                #{caseData.case_number}
              </Typography>
              <StatusChip status={caseData.status} />
            </Stack>

            {/* TODO: Add action buttons (Edit, etc.) */}
          </Stack>

          {/* Case metadata */}
          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Job Type
              </Typography>
              <Typography variant="body2">{caseData.job_type || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Priority
              </Typography>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {caseData.priority}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Region
              </Typography>
              <Typography variant="body2">{caseData.regions?.name || '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Service Tracker
              </Typography>
              <Typography variant="body2">{caseData.service_trackers?.name || '—'}</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Tabbed content */}
        <CaseDetailTabs
          caseData={caseData}
          fieldsBySection={fieldsBySection}
        />
      </Box>
    </AppShell>
  );
}
