import { createContext, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type { PaletteMode } from '@mui/material';

export type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  computedMode: PaletteMode; // The actual resolved mode (light/dark)
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

function getSystemMode(): PaletteMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function SettingsProvider({ children }: SettingsProviderProps): ReactElement {
  // Theme Mode
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('app_theme_mode') as ThemeMode) || 'light';
  });

  const [computedMode, setComputedMode] = useState<PaletteMode>(() => {
    return themeMode === 'system' ? getSystemMode() : themeMode;
  });

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('app_theme_mode', mode);
  };

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setComputedMode(e.matches ? 'dark' : 'light');
      };
      setComputedMode(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    setComputedMode(themeMode as PaletteMode);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      computedMode,
    }),
    [themeMode, computedMode]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
