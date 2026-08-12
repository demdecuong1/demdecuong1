'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Warm, Organic, Monochrome Theme
 *
 * Design principles:
 * - Light, warm color palette (cream, beige, warm grays)
 * - Organic, natural feel
 * - Tight spacing for density
 * - Rounded corners throughout
 * - Borders instead of shadows
 * - Monochrome with subtle accents
 */

// Warm monochrome palette
const warmColors = {
  // Backgrounds - warm creams and beiges
  bg: {
    primary: '#faf8f5',      // Warm off-white
    secondary: '#f5f2ed',    // Light cream
    tertiary: '#ebe8e3',     // Warm gray
  },
  // Text - warm grays
  text: {
    primary: '#2d2a26',      // Dark warm gray
    secondary: '#5a5550',    // Medium warm gray
    tertiary: '#8a857f',     // Light warm gray
  },
  // Borders - warm neutrals
  border: {
    light: '#e5e1db',        // Very light warm gray
    main: '#d4cfc7',         // Light warm gray
    dark: '#b8b3ab',         // Medium warm gray
  },
  // Accent - minimal, warm
  accent: {
    primary: '#4a4540',      // Dark warm gray (primary actions)
    secondary: '#6b6560',    // Medium warm gray
    hover: '#3a3532',        // Darker on hover
  },
};

// Status colors - monochrome with warm tones
export const statusColors = {
  open: {
    main: '#2d2a26',
    light: '#ebe8e3',
    contrastText: '#faf8f5',
  },
  in_progress: {
    main: '#5a5550',
    light: '#d4cfc7',
    contrastText: '#faf8f5',
  },
  scheduled: {
    main: '#6b6560',
    light: '#e5e1db',
    contrastText: '#faf8f5',
  },
  on_hold: {
    main: '#8a857f',
    light: '#ebe8e3',
    contrastText: '#2d2a26',
  },
  completed: {
    main: '#4a4540',
    light: '#d4cfc7',
    contrastText: '#faf8f5',
  },
  cancelled: {
    main: '#b8b3ab',
    light: '#f5f2ed',
    contrastText: '#2d2a26',
  },
} as const;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: warmColors.accent.primary,
      light: warmColors.accent.secondary,
      dark: warmColors.accent.hover,
      contrastText: warmColors.bg.primary,
    },
    secondary: {
      main: warmColors.text.secondary,
      light: warmColors.text.tertiary,
      dark: warmColors.text.primary,
      contrastText: warmColors.bg.primary,
    },
    error: {
      main: '#4a4540',
      light: '#ebe8e3',
      dark: '#2d2a26',
      contrastText: warmColors.bg.primary,
    },
    warning: {
      main: '#5a5550',
      light: '#d4cfc7',
      dark: '#3a3532',
      contrastText: warmColors.bg.primary,
    },
    info: {
      main: '#6b6560',
      light: '#e5e1db',
      dark: '#4a4540',
      contrastText: warmColors.bg.primary,
    },
    success: {
      main: '#4a4540',
      light: '#d4cfc7',
      dark: '#2d2a26',
      contrastText: warmColors.bg.primary,
    },
    background: {
      default: warmColors.bg.primary,
      paper: warmColors.bg.secondary,
    },
    text: {
      primary: warmColors.text.primary,
      secondary: warmColors.text.secondary,
      disabled: warmColors.text.tertiary,
    },
    divider: warmColors.border.main,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    // Tight line heights for density
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    body1: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    body2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: warmColors.text.tertiary,
    },
  },
  shape: {
    borderRadius: 16, // More rounded, organic feel
  },
  spacing: 6, // Tighter spacing (default is 8)
  shadows: [
    'none',
    'none', // No shadows - borders only
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
    'none',
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: warmColors.bg.primary,
          color: warmColors.text.primary,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: warmColors.bg.secondary,
          color: warmColors.text.primary,
          borderBottom: `1px solid ${warmColors.border.main}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: warmColors.bg.secondary,
          borderRight: `1px solid ${warmColors.border.main}`,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: warmColors.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${warmColors.border.main}`,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: warmColors.bg.secondary,
          borderRadius: 16,
          border: `1px solid ${warmColors.border.main}`,
          boxShadow: 'none',
        },
        outlined: {
          border: `1px solid ${warmColors.border.main}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          border: `1px solid ${warmColors.border.light}`,
        },
        outlined: {
          borderColor: warmColors.border.main,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px', // Tighter padding
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: warmColors.accent.primary,
          color: warmColors.bg.primary,
          border: `1px solid ${warmColors.accent.primary}`,
          '&:hover': {
            backgroundColor: warmColors.accent.hover,
            borderColor: warmColors.accent.hover,
          },
        },
        outlined: {
          borderColor: warmColors.border.dark,
          color: warmColors.text.primary,
          '&:hover': {
            borderColor: warmColors.accent.primary,
            backgroundColor: warmColors.bg.tertiary,
          },
        },
        text: {
          color: warmColors.text.primary,
          '&:hover': {
            backgroundColor: warmColors.bg.tertiary,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '&:hover': {
            backgroundColor: warmColors.bg.tertiary,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: warmColors.bg.primary,
            '& fieldset': {
              borderColor: warmColors.border.main,
            },
            '&:hover fieldset': {
              borderColor: warmColors.border.dark,
            },
            '&.Mui-focused fieldset': {
              borderColor: warmColors.accent.primary,
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${warmColors.border.light}`,
          padding: '10px 12px', // Tighter padding
        },
        head: {
          backgroundColor: warmColors.bg.tertiary,
          fontWeight: 600,
          borderBottom: `1px solid ${warmColors.border.main}`,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: `1px solid ${warmColors.border.main}`,
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 42, // Tighter
          padding: '8px 12px',
          '&.Mui-selected': {
            color: warmColors.text.primary,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 42,
        },
        indicator: {
          backgroundColor: warmColors.accent.primary,
          height: 2,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 2,
          '&:hover': {
            backgroundColor: warmColors.bg.tertiary,
          },
          '&.Mui-selected': {
            backgroundColor: warmColors.bg.tertiary,
            borderLeft: `3px solid ${warmColors.accent.primary}`,
            '&:hover': {
              backgroundColor: warmColors.bg.tertiary,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: warmColors.border.main,
        },
      },
    },
  },
});

export default theme;

// Monospace font for case numbers and serial numbers
export const monoFont = '"JetBrains Mono", "Roboto Mono", "Courier New", monospace';
