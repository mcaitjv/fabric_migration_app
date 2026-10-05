import { bridgeFabricCallback } from '@microsoft/rayfin-auth-provider-fabric';
import { Agentation } from 'agentation';
import { ThemeProvider } from 'next-themes';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import { Toaster } from './components/ui/sonner';
import { ErrorFallback } from './ErrorFallback.tsx';
import { AuthProvider } from './hooks/AuthContext.tsx';
import { ServiceContainer } from './services/ServiceContainer';

import './main.css';
import './styles/theme.css';
import './index.css';

// Backward compat: old Fabric Portal may redirect the popup to the bare origin
// with handoff params in the URL hash. Bridge the code to the opener and close.
if (bridgeFabricCallback()) {
  // Popup is closing — skip the rest of the bootstrap.
} else {
  // Initialize the service container (creates RayfinClient and services).
  await ServiceContainer.create();

  createRoot(document.getElementById('root')!).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
          {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
