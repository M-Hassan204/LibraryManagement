import { useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import { AuthProvider } from '@/context/AuthContext';
import { createAppTheme } from '@/theme/theme';
import { router } from '@/router';
import type { PaletteMode } from '@mui/material';

// ─── TanStack Query client ────────────────────────────────────────────────────
// Configured globally here. All query options are set once, not per-hook.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,        // Data is fresh for 2 minutes
      gcTime: 1000 * 60 * 10,          // Cache kept for 10 minutes after unmount
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: false,      // Don't refetch on tab focus (can surprise users)
    },
    mutations: {
      retry: 0,                         // Never retry mutations — they have side effects
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

function App(): React.ReactElement {
  // Dark mode is the default. Theme toggle propagates from TopBar → here.
  const [mode, setMode] = useState<PaletteMode>('dark');

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = (): void => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // toggleTheme is passed via React context in a real app.
  // For now it's wired at the App level and will be threaded through
  // ThemeContext once the TopBar component is built.
  void toggleTheme; // suppress unused warning until wired

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
