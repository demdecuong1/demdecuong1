/**
 * FieldDisplay Component
 * Display a single field with label and value
 */

import { Box, Typography } from '@mui/material';

interface FieldDisplayProps {
  label: string;
  value: string | number | boolean | null | undefined;
  fullWidth?: boolean;
}

export default function FieldDisplay({ label, value, fullWidth = false }: FieldDisplayProps) {
  const displayValue = value === null || value === undefined || value === ''
    ? '—'
    : typeof value === 'boolean'
    ? value ? 'Yes' : 'No'
    : String(value);

  return (
    <Box sx={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body1">{displayValue}</Typography>
    </Box>
  );
}
