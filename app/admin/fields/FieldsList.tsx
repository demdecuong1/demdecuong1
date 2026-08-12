'use client';

/**
 * FieldsList Component
 * Table showing all field definitions with edit/deprecate actions
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Stack,
  Link as MuiLink,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, VisibilityOff as DeprecatedIcon } from '@mui/icons-material';
import Link from 'next/link';
import type { FieldDefinition } from '@/lib/data/fieldDefinitions';

interface FieldsListProps {
  fields: FieldDefinition[];
}

const SECTION_LABELS: Record<string, string> = {
  customer: 'Customer',
  device: 'Device',
  service: 'Service',
  dates: 'Dates',
  additional: 'Additional',
};

const DATA_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  textarea: 'Text Area',
  number: 'Number',
  date: 'Date',
  boolean: 'Yes/No',
  select: 'Select',
};

export default function FieldsList({ fields }: FieldsListProps) {
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const filteredFields = fields.filter(field => {
    const matchesSection = sectionFilter === 'all' || field.section === sectionFilter;
    const isActive = field.visible_to_roles.length > 0;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'deprecated' && !isActive);

    return matchesSection && matchesStatus;
  });

  // Group by section for display
  const sections = Array.from(new Set(filteredFields.map(f => f.section))).sort();

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
        }}
      >
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={sectionFilter}
              label="Section"
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              <MenuItem value="all">All Sections</MenuItem>
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="deprecated">Deprecated</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Table */}
      {sections.map(section => {
        const sectionFields = filteredFields.filter(f => f.section === section);
        if (sectionFields.length === 0) return null;

        return (
          <Box key={section} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              {SECTION_LABELS[section]}
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Key</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Visible To</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sort</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectionFields.map(field => {
                    const isDeprecated = field.visible_to_roles.length === 0;

                    return (
                      <TableRow
                        key={field.id}
                        sx={{
                          opacity: isDeprecated ? 0.5 : 1,
                          '&:last-child td': { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              color: isDeprecated ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {field.key}
                          </Typography>
                        </TableCell>
                        <TableCell>{field.label}</TableCell>
                        <TableCell>
                          <Chip
                            label={DATA_TYPE_LABELS[field.data_type] || field.data_type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {isDeprecated ? (
                            <Chip
                              icon={<DeprecatedIcon />}
                              label="Deprecated"
                              size="small"
                              color="default"
                            />
                          ) : (
                            <Typography variant="caption">
                              {field.visible_to_roles.length} role{field.visible_to_roles.length !== 1 ? 's' : ''}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {field.required ? (
                            <Chip label="Yes" size="small" />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {field.sort_order}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            component={Link}
                            href={`/admin/fields/${field.id}`}
                            size="small"
                            title="Edit field"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}

      {filteredFields.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No fields found
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
