import { useMemo, useState } from 'react';
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
import type { PaletteMode } from '@mui/material';

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
      {children}
    </QueryClientProvider>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App(): React.ReactElement {
  const [mode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createAppTheme(mode as PaletteMode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <AppProviders>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </AppProviders>
    </ThemeProvider>
  );
}

export default App;
