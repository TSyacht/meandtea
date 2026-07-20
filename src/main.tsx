import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx running - 2026-05-15 01:25');

// Force scroll restoration to manual so the browser never attempts to auto-restore scroll position on reload/refresh
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

// Force scroll to top immediately on script execution to ensure the viewport starts at the exact top
if (typeof window !== 'undefined') {
  window.scrollTo(0, 0);
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
    document.documentElement.style.scrollBehavior = 'auto';
  }
  if (document.body) {
    document.body.scrollTop = 0;
    document.body.style.scrollBehavior = 'auto';
  }
}

// Catch Vite dynamic import / preload failures and log/prevent reload loop
const safeReload = (reason: string) => {
  console.warn(`[Reload Suppressed] Suppressed automatic page reload for stability. Reason: ${reason}`);
};

window.addEventListener('vite:preloadError', (event) => {
  // Only reload if the tab is visible and we're not currently in an active user flow
  if (document.visibilityState === 'hidden') {
    console.warn('Vite preload error detected in background tab, ignoring to prevent disruptive reload.');
    return;
  }
  console.warn('Vite preload error detected, reloading page to fetch latest build...', event);
  safeReload('Vite preload error');
});

window.addEventListener('error', (event) => {
  // If the document is hidden or backgrounded, ignore resource/script errors
  if (document.visibilityState === 'hidden') {
    return;
  }

  const message = (event.message || '').toLowerCase();
  const srcElement = event.target as any;
  const isScriptOrLink = srcElement && (srcElement.tagName === 'SCRIPT' || srcElement.tagName === 'LINK');
  
  // Guard: Only handle script or link errors if they originate from our same origin
  if (isScriptOrLink) {
    const srcUrl = srcElement.src || srcElement.href || '';
    if (srcUrl) {
      try {
        const urlObj = new URL(srcUrl, window.location.origin);
        if (urlObj.origin !== window.location.origin) {
          // Ignore external/extension script/stylesheet load failures
          console.info(`Ignored external script/stylesheet load failure to prevent reload: ${srcUrl}`);
          return;
        }
      } catch (e) {
        // Invalid URL, ignore
        return;
      }
    } else {
      // Script tag without src (inline script error), do not reload
      return;
    }
  }

  const isDynamicImportFailure = 
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('load chunk') ||
    message.includes('unexpected token \'<\'');

  if (isDynamicImportFailure) {
    event.preventDefault();
    safeReload(`Dynamic import failure: ${message}`);
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
