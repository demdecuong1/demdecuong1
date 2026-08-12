/**
 * SectionCard Component
 * Material Design 3 card for grouping related fields
 */

import { Card, CardContent, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 2,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'primary.main',
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}
