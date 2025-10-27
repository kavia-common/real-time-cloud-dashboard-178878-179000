import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import './index.css';
import './styles/theme.css';

import http, { healthCheck } from './api/http';
import { API_BASE_URL, API_PATH_PREFIX, endpoints } from './api/endpoints';

/**
 * App entry wraps global providers and renders routes.
 * Adds a startup connectivity check and a visible banner when backend is unreachable.
 */
function App() {
  const [connectivity, setConnectivity] = useState({ ok: true, checking: true, message: '' });

  // Startup connectivity probe
  useEffect(() => {
    let cancelled = false;

    const probe = async () => {
      try {
        // Try well-known health paths: /api/health then /api/auth/echo (GET)
        const ok = await healthCheck();
        if (!ok) {
          try {
            await http.get(endpoints.util.echo.replace(API_BASE_URL, '').replace(/^https?:\/\/[^/]+/, ''));
            if (!cancelled) setConnectivity({ ok: true, checking: false, message: '' });
            return;
          } catch {
            // ignore, will mark as down
          }
        }
        if (!cancelled) {
          setConnectivity({
            ok,
            checking: false,
            message: ok ? '' : 'Backend appears unreachable. Check that the server is running and /api prefix is correct.',
          });
        }
      } catch (e) {
        if (!cancelled) {
          setConnectivity({
            ok: false,
            checking: false,
            message:
              'Backend unreachable. Verify REACT_APP_API_BASE_URL and set REACT_APP_API_PATH_PREFIX=/api. Disable ad/tracker blockers for this site.',
          });
        }
      }
    };

    // Diagnostics to console
    // eslint-disable-next-line no-console
    console.info('[Startup] API_BASE_URL=', API_BASE_URL, 'API_PATH_PREFIX=', API_PATH_PREFIX || '(none)');
    // eslint-disable-next-line no-console
    console.info('[Startup] SOCKET_URL=', process.env.REACT_APP_SOCKET_URL || '(not set)', 'SOCKET_PATH=', process.env.REACT_APP_SOCKET_PATH || '/socket.io');

    probe();
    return () => {
      cancelled = true;
    };
  }, []);

  const Banner = useMemo(() => {
    if (connectivity.ok) return null;
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          background: '#FEF3C7',
          color: '#92400E',
          padding: '10px 16px',
          borderBottom: '1px solid #F59E0B',
          fontSize: 14,
        }}
      >
        <strong>Connection issue:</strong> {connectivity.message}{' '}
        <span style={{ opacity: 0.8 }}>
          Current base: {API_BASE_URL}
          {API_PATH_PREFIX ? `, prefix: ${API_PATH_PREFIX}` : ', prefix: (none)'}
        </span>
      </div>
    );
  }, [connectivity, API_BASE_URL, API_PATH_PREFIX]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {Banner}
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
