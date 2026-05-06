import '@/styles/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initAnalytics } from './lib/analytics';

initAnalytics(import.meta.env['VITE_POSTHOG_KEY'] as string | undefined, {
  host: (import.meta.env['VITE_POSTHOG_HOST'] as string | undefined) ?? 'https://eu.i.posthog.com',
});

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
