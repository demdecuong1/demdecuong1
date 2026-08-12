'use client';

/**
 * FieldForm Component
 * Reusable form for creating and editing field definitions
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Button,
  Stack,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import Link from 'next/link';
import { createFieldAction, updateFieldAction } from './actions';
import type { FieldDefinition } from '@/lib/data/fieldDefinitions';

interface FieldFormProps {
  mode: 'create' | 'edit';
  field?: FieldDefinition;
}

const DATA_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'select', label: 'Select (dropdown)' },
];

const SECTIONS = [
  { value: 'customer', label: 'Customer Information' },
  { value: 'device', label: 'Device Information' },
  { value: 'service', label: 'Service Details' },
  { value: 'dates', label: 'Important Dates' },
  { value: 'additional', label: 'Additional Information' },
];

const ROLES = [
  { value: 'portal_admin', label: 'Portal Admin' },
  { value: 'internal_manager', label: 'Internal Manager' },
  { value: 'internal_user', label: 'Internal User' },
  { value: 'service_partner', label: 'Service Partner' },
];

export default function FieldForm({ mode, field }: FieldFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [key, setKey] = useState(field?.key || '');
  const [label, setLabel] = useState(field?.label || '');
  const [dataType, setDataType] = useState(field?.data_type || 'text');
  const [section, setSection] = useState(field?.section || 'customer');
  const [required, setRequired] = useState(field?.required || false);
  const [sortOrder, setSortOrder] = useState(field?.sort_order || 0);
  const [options, setOptions] = useState(field?.options?.join('\n') || '');
  const [roles, setRoles] = useState({
    portal_admin: field?.visible_to_roles.includes('portal_admin') ?? true,
    internal_manager: field?.visible_to_roles.includes('internal_manager') ?? true,
    internal_user: field?.visible_to_roles.includes('internal_user') ?? true,
    service_partner: field?.visible_to_roles.includes('service_partner') ?? true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setErrors([]);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = mode === 'create'
        ? await createFieldAction(formData)
        : await updateFieldAction(field!.id, formData);

      if (result.success) {
        router.push('/admin/fields');
        router.refresh();
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setError(result.message || 'An error occurred');
        }
      }
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <Stack spacing={2}>
          <TextField
            name="key"
            label="Field Key"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase())}
            required
            fullWidth
            disabled={mode === 'edit'}
            helperText={mode === 'edit' ? 'Key cannot be changed after creation' : 'Lowercase letters, numbers, underscores only (e.g., customer_email)'}
            inputProps={{
              pattern: '[a-z][a-z0-9_]*',
            }}
          />

          <TextField
            name="label"
            label="Display Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            fullWidth
            helperText="User-friendly label shown in the UI (e.g., Customer Email)"
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Data Type</InputLabel>
              <Select
                name="data_type"
                value={dataType}
                label="Data Type"
                onChange={(e) => setDataType(e.target.value as any)}
              >
                {DATA_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                name="section"
                value={section}
                label="Section"
                onChange={(e) => setSection(e.target.value as any)}
              >
                {SECTIONS.map((sec) => (
                  <MenuItem key={sec.value} value={sec.value}>
                    {sec.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            name="sort_order"
            label="Sort Order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value))}
            required
            fullWidth
            helperText="Fields are displayed in ascending order within their section"
          />

          {dataType === 'select' && (
            <TextField
              name="options"
              label="Options (one per line)"
              value={options}
              onChange={(e) => setOptions(e.target.value)}
              multiline
              rows={4}
              fullWidth
              helperText="Enter each option on a new line"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                name="required"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                value="true"
              />
            }
            label="Required field"
          />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          Visible to Roles
        </FormLabel>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Select which roles can see this field in case details
        </Typography>

        <FormGroup>
          {ROLES.map((role) => (
            <FormControlLabel
              key={role.value}
              control={
                <Checkbox
                  name={`role_${role.value}`}
                  checked={roles[role.value as keyof typeof roles]}
                  onChange={(e) => setRoles({ ...roles, [role.value]: e.target.checked })}
                />
              }
              label={role.label}
            />
          ))}
        </FormGroup>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : mode === 'create' ? 'Create field' : 'Update field'}
        </Button>

        <Button
          component={Link}
          href="/admin/fields"
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={isPending}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
