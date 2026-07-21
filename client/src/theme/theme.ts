import { createTheme, type PaletteMode } from '@mui/material';
import { palette } from './palette';
import { typography } from './typography';

// ─── Theme factory ────────────────────────────────────────────────────────────
//
// Creates a complete MUI theme for either 'light' or 'dark' mode.
// The mode is toggled at the App level and passed down via ThemeProvider.
//
// Design rationale:
// - Dark mode is the default — it suits a professional library dashboard
//   and is increasingly the expectation in modern SaaS tools.
// - All color references use our palette tokens, never raw hex values.
// - Component overrides are defined here so individual components
//   never need ad-hoc styling for global concerns.

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: palette.primary,
      secondary: palette.secondary,
      success: palette.success,
      warning: palette.warning,
      error: palette.error,
      info: palette.info,
      background:
        mode === 'dark'
          ? {
              default: palette.dark.background,
              paper: palette.dark.paper,
            }
          : {
              default: palette.light.background,
              paper: palette.light.paper,
            },
      text:
        mode === 'dark'
          ? {
              primary: '#F1F5F9',
              secondary: '#94A3B8',
              disabled: '#475569',
            }
          : {
              primary: '#0F172A',
              secondary: '#475569',
              disabled: '#94A3B8',
            },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },

    typography,

    shape: {
      borderRadius: 10,
    },

    // ── Component overrides ─────────────────────────────────────────────────
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
              transition: 'transform 0.15s ease',
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            border:
              mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: 'small',
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: mode === 'dark' ? '#94A3B8' : '#64748B',
            borderBottom:
              mode === 'dark'
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(0,0,0,0.08)',
          },
          body: {
            borderBottom:
              mode === 'dark'
                ? '1px solid rgba(255,255,255,0.04)'
                : '1px solid rgba(0,0,0,0.04)',
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRight:
              mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom:
              mode === 'dark'
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.06)',
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
          },
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },

      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor:
              mode === 'dark'
                ? `${palette.primary.dark} transparent`
                : `${palette.primary.light} transparent`,
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor:
                mode === 'dark'
                  ? palette.primary.dark
                  : palette.primary.light,
              borderRadius: 3,
            },
          },
        },
      },
    },
  });
