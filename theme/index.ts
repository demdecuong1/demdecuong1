'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Material Design 3 theme for Evident Case Portal
 * Primary brand color: #2FF7B8 (teal/mint green)
 *
 * This theme implements Material 3 design tokens:
 * - Color roles (primary, secondary, surface variants)
 * - Typography scale (display, headline, title, body, label)
 * - Shape tokens (rounded corners)
 * - Elevation system
 */

// Material 3 color palette derived from primary seed #2FF7B8
const m3Colors = {
  primary: {
    main: '#00c896', // Adjusted for better contrast from #2FF7B8
    light: '#2FF7B8',
    dark: '#00a67d',
    contrastText: '#003828',
  },
  secondary: {
    main: '#4b635b',
    light: '#c2e9dd',
    dark: '#32493f',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ba1a1a',
    light: '#ffdad6',
    dark: '#93000a',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#7d5700',
    light: '#ffddb5',
    dark: '#614200',
    contrastText: '#ffffff',
  },
  info: {
    main: '#006a6a',
    light: '#6ff7f6',
    dark: '#004f50',
    contrastText: '#ffffff',
  },
  success: {
    main: '#006e26',
    light: '#8bff7e',
    dark: '#005319',
    contrastText: '#ffffff',
  },
  // Surface colors (Material 3)
  background: {
    default: '#f6fef9',
    paper: '#f6fef9',
  },
  // M3 surface variants
  surfaceVariant: '#dae5de',
  outline: '#6f7970',
  outlineVariant: '#bfc9c2',
};

// Status color mapping for case statuses
export const statusColors = {
  open: {
    main: '#006a6a',
    light: '#b1f0ee',
    contrastText: '#ffffff',
  },
  in_progress: {
    main: '#7d5700',
    light: '#ffddb5',
    contrastText: '#ffffff',
  },
  scheduled: {
    main: '#0061a4',
    light: '#b8e7ff',
    contrastText: '#ffffff',
  },
  on_hold: {
    main: '#7d5260',
    light: '#ffd8e4',
    contrastText: '#ffffff',
  },
  completed: {
    main: '#006e26',
    light: '#8bff7e',
    contrastText: '#ffffff',
  },
  cancelled: {
    main: '#5f5e5e',
    light: '#e3e2e2',
    contrastText: '#ffffff',
  },
} as const;

const theme = createTheme({
  palette: {
    mode: 'light',
    ...m3Colors,
  },
  typography: {
    // Material 3 type scale
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Display (largest)
    h1: {
      fontSize: '3.5625rem', // 57px
      fontWeight: 400,
      lineHeight: 1.12,
      letterSpacing: '-0.25px',
    },
    // Headline Large
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: '0px',
    },
    // Headline Medium
    h3: {
      fontSize: '1.75rem', // 28px
      fontWeight: 400,
      lineHeight: 1.29,
      letterSpacing: '0px',
    },
    // Headline Small / Title Large
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: '0px',
    },
    // Title Medium
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.15px',
    },
    // Title Small
    h6: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
    },
    // Body Large
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    },
    // Body Medium
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.25px',
    },
    // Label Large (buttons)
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
      textTransform: 'none', // Sentence case per CLAUDE.md
    },
    // Caption / Label Small
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: '0.4px',
    },
    // Overline not used in M3
  },
  shape: {
    // Material 3 rounded corners
    borderRadius: 12,
  },
  shadows: [
    'none',
    // M3 elevation tokens (levels 1-5)
    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
    '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
    '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
    '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
    // Repeat level 5 for remaining MUI shadow levels
    ...Array(19).fill('0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // M3 baseline styles
          backgroundColor: m3Colors.background.default,
          color: '#1c1b1f',
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: m3Colors.background.paper,
          color: '#1c1b1f',
          borderBottom: `1px solid ${m3Colors.outlineVariant}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${m3Colors.outlineVariant}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // M3 fully rounded buttons
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

export default theme;

// Monospace font for case numbers and serial numbers
export const monoFont = '"Roboto Mono", "Courier New", monospace';
