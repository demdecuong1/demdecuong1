/**
 * PageHeader Component
 * Material Design 3 page header with title and optional count/actions
 */

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  count?: number;
  actions?: ReactNode;
}

export default function PageHeader({ title, count, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      <Typography variant="h4" component="h1">
        {title}
        {count !== undefined && (
          <Typography
            component="span"
            variant="h4"
            sx={{ color: 'text.secondary', ml: 1 }}
          >
            — {count}
          </Typography>
        )}
      </Typography>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
}
