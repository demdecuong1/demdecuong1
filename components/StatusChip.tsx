'use client';

import { Chip, ChipProps } from '@mui/material';
import { statusColors } from '@/theme';

type CaseStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: CaseStatus;
}

const statusLabels: Record<CaseStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

/**
 * Material Design 3 status chip for case statuses.
 * Uses themed status colors defined in theme/index.ts.
 */
export default function StatusChip({ status, ...props }: StatusChipProps) {
  const colors = statusColors[status];

  return (
    <Chip
      label={statusLabels[status]}
      sx={{
        backgroundColor: colors.light,
        color: colors.main,
        fontWeight: 600,
        borderRadius: 2,
        ...props.sx,
      }}
      {...props}
    />
  );
}
