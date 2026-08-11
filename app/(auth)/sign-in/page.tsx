'use client';

/**
 * Sign-In Page
 * Material Design 3 email/password authentication
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { createBrowserClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Successful login - redirect to cases
        router.push('/cases');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Evident Case Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage service cases
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="email"
            autoFocus
            disabled={loading}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoComplete="current-password"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign in'}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Test accounts:
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • admin@evident.com
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • manager@evident.com
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • user@evident.com
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Password: Password123!
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
