'use client';

/**
 * CaseList Component
 * Material Design 3 table with filters for case list
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Link from 'next/link';
import StatusChip from '@/components/StatusChip';
import type { Case } from '@/lib/data/cases';
import type { UserRole } from '@/lib/auth';

interface CaseListProps {
  cases: Case[];
  totalCount: number;
  userRole: UserRole;
}

const ALL_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export default function CaseList({ cases, totalCount, userRole }: CaseListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const activeStatuses = searchParams.getAll('status');

  const handleStatusToggle = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentStatuses = params.getAll('status');

    if (currentStatuses.includes(status)) {
      // Remove this status
      params.delete('status');
      currentStatuses.filter(s => s !== status).forEach(s => params.append('status', s));
    } else {
      // Add this status
      params.append('status', status);
    }

    router.push(`/cases?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }

    router.push(`/cases?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <Box>
      {/* Filters */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          {/* Search */}
          <TextField
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />

          {/* Status filters */}
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Filter by status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {ALL_STATUSES.map((status) => (
                <Chip
                  key={status.value}
                  label={status.label}
                  onClick={() => handleStatusToggle(status.value)}
                  variant={activeStatuses.includes(status.value) ? 'filled' : 'outlined'}
                  color={activeStatuses.includes(status.value) ? 'primary' : 'default'}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Case #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Job Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Region</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Service Tracker</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    No cases found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {activeStatuses.length > 0 || searchQuery
                      ? 'Try adjusting your filters'
                      : 'Get started by creating your first case'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <MuiLink
                      component={Link}
                      href={`/cases/${caseItem.id}`}
                      underline="hover"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    >
                      #{caseItem.case_number}
                    </MuiLink>
                  </TableCell>
                  <TableCell>
                    {caseItem.data?.customer_name || '—'}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={caseItem.status} size="small" />
                  </TableCell>
                  <TableCell>{caseItem.job_type || '—'}</TableCell>
                  <TableCell>{caseItem.regions?.name || '—'}</TableCell>
                  <TableCell>{caseItem.service_trackers?.name || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(caseItem.updated_at)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
