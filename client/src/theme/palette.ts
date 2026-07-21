// Brand color palette tokens.
// All colors in the application must reference these tokens.
// Never use raw hex values inside components.

export const palette = {
  // Primary — Indigo. Conveys trust, sophistication, and academic professionalism.
  primary: {
    main: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },

  // Secondary — Amber. Used sparingly for accents and CTAs.
  secondary: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    contrastText: '#1A1A2E',
  },

  // Status colors — used for chips and alerts
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },

  // Dark mode backgrounds
  dark: {
    background: '#0F1117',
    paper: '#1A1D27',
    surface1: '#1E2130',
    surface2: '#252838',
  },

  // Light mode backgrounds
  light: {
    background: '#F8FAFC',
    paper: '#FFFFFF',
    surface1: '#F1F5F9',
    surface2: '#E2E8F0',
  },
} as const;
