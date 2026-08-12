import { Box, Card, CardContent, Typography, Button, Stack, Grid } from '@mui/material';
import { Settings as SettingsIcon, ViewList as FieldsIcon } from '@mui/icons-material';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { getCurrentUser } from '@/lib/auth';

/**
 * Admin dashboard - portal_admin only
 */
export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const adminSections = [
    {
      title: 'Field Definitions',
      description: 'Manage dynamic case fields, sections, and visibility',
      icon: <FieldsIcon sx={{ fontSize: 48 }} />,
      href: '/admin/fields',
      color: '#4a4540',
    },
    {
      title: 'System Settings',
      description: 'Configure portal settings and preferences',
      icon: <SettingsIcon sx={{ fontSize: 48 }} />,
      href: '/admin/settings',
      color: '#5a5550',
      disabled: true,
    },
  ];

  return (
    <AppShell user={user.profile}>
      <Box>
        <PageHeader title="Admin" />

        <Typography variant="body1" color="text.secondary" paragraph>
          Administrative tools for portal configuration and management.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {adminSections.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: section.disabled ? 0.6 : 1,
                  pointerEvents: section.disabled ? 'none' : 'auto',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ color: section.color, mb: 2 }}>
                    {section.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {section.description}
                  </Typography>
                  <Button
                    component={Link}
                    href={section.href}
                    variant="outlined"
                    disabled={section.disabled}
                    sx={{ mt: 'auto' }}
                  >
                    {section.disabled ? 'Coming soon' : 'Manage'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AppShell>
  );
}
