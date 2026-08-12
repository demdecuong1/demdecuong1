import { Box, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';

/**
 * 404 page for case not found or access denied
 */
export default function CaseNotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: 64,
            color: 'text.secondary',
            mb: 2,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom>
          Case not found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The case you're looking for doesn't exist or you don't have permission to view it.
        </Typography>
        <Button
          component={Link}
          href="/cases"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to cases
        </Button>
      </Paper>
    </Box>
  );
}
