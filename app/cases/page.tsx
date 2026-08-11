import { Typography, Box, Card, CardContent } from '@mui/material';
import AppShell from '@/components/AppShell';
import StatusChip from '@/components/StatusChip';

/**
 * Cases list page (placeholder for Phase 0)
 * Will be fully implemented in Phase 3
 */
export default function CasesPage() {
  return (
    <AppShell>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cases
        </Typography>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Welcome to the Evident Case Portal. This is a placeholder page.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The case list will be implemented in Phase 3.
            </Typography>

            {/* Demo status chips to verify theme */}
            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <StatusChip status="open" />
              <StatusChip status="in_progress" />
              <StatusChip status="resolved" />
              <StatusChip status="closed" />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AppShell>
  );
}
