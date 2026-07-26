import React, { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { AuthProvider } from '@/context/AuthContext';
import { createAppTheme } from '@/theme/theme';
import { router } from '@/router';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';

// ─── QueryClient Wrapper ──────────────────────────────────────────────────────
function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    mutationCache: new MutationCache({
      onSuccess: () => {
        // We can add default success handling here if needed
        // The specific message should be passed from the mutation
      },
      onError: () => {
        // We can add default error handling here if needed
        // The specific error message should be passed from the mutation
      },
    })
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </QueryClientProvider>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { computedMode } = useSettings();
  const theme = useMemo(() => createAppTheme(computedMode), [computedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App(): React.ReactElement {
  return (
    <AppProviders>
      <ThemeWrapper>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeWrapper>
    </AppProviders>
  );
}

export default App;
