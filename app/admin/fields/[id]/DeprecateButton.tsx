'use client';

/**
 * DeprecateButton Component
 * Button with confirmation dialog to deprecate a field
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { deprecateFieldAction } from '../actions';

interface DeprecateButtonProps {
  fieldId: string;
  fieldKey: string;
  usageCount: number;
}

export default function DeprecateButton({ fieldId, fieldKey, usageCount }: DeprecateButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDeprecate = () => {
    setError(null);

    startTransition(async () => {
      const result = await deprecateFieldAction(fieldId);

      if (result.success) {
        setOpen(false);
        router.push('/admin/fields');
        router.refresh();
      } else {
        setError(result.message || 'Failed to deprecate field');
      }
    });
  };

  return (
    <>
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={() => setOpen(true)}
      >
        Deprecate field
      </Button>

      <Dialog open={open} onClose={() => !isPending && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deprecate Field?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deprecate the field <strong>{fieldKey}</strong>?
          </DialogContentText>

          {usageCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This field is currently used in <strong>{usageCount}</strong> case{usageCount !== 1 ? 's' : ''}.
              Deprecating it will hide the field from forms and the UI, but existing data will be preserved.
            </Alert>
          )}

          <DialogContentText sx={{ mt: 2 }}>
            Deprecated fields:
          </DialogContentText>
          <ul style={{ marginTop: 8 }}>
            <li>Will not appear in case detail views</li>
            <li>Will not be available when creating/editing cases</li>
            <li>Can be reactivated later by editing visibility settings</li>
            <li>Existing field data in cases will NOT be deleted</li>
          </ul>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleDeprecate}
            color="error"
            variant="contained"
            disabled={isPending}
          >
            {isPending ? 'Deprecating...' : 'Deprecate field'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
