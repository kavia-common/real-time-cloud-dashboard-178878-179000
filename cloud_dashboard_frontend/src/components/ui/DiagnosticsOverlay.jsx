import React, { useEffect, useMemo, useState } from 'react';
import http from '../../api/http';
import { endpoints, API_BASE_URL, API_PATH_PREFIX } from '../../api/endpoints';

/**
 * PUBLIC_INTERFACE
 * DiagnosticsOverlay
 * A lightweight in-app diagnostics panel/overlay that:
 * - Pings /api/health and /api/auth/echo
 * - Attempts fallback base URL strategies when initial ping fails
 * - Displays resolved API base URL, prefix, and socket path (from env)
 * - Provides adblock/CORS guidance messages
 */
export default function DiagnosticsOverlay({ open, onClose, onResolvedBase }) {
  // Hooks must be called unconditionally to satisfy rules-of-hooks
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';
  const SOCKET_PATH = process.env.REACT_APP_SOCKET_PATH || '/socket.io';

  const [status, setStatus] = useState({
    health: null,
    echo: null,
    resolvedBase: API_BASE_URL,
    resolvedPrefix: API_PATH_PREFIX || '',
    attempts: [],
    note: '',
    busy: true,
  });

  // Try multiple base URL strategies to find a working one
  const candidateBases = useMemo(() => {
    const origin = window.location.origin;
    const protocol = window.location.protocol;
    const host = window.location.host;
    const candidates = [
      API_BASE_URL,
      origin,
      `${protocol}//${host}`,
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      '',
    ];
    return candidates.filter((v, i, arr) => arr.indexOf(v) === i);
  }, []);

  useEffect(() => {
    if (!open) return; // do nothing if overlay is closed

    let cancelled = false;

    const ping = async (base, prefix) => {
      const url = `${base}${prefix ? `/${String(prefix).replace(/^\/+/, '')}` : ''}/health`;
      try {
        const res = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store' });
        if (res.ok) return { ok: true, status: res.status };
        return { ok: false, status: res.status };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    };

    const tryEcho = async (base, prefix) => {
      const url = `${base}${prefix ? `/${String(prefix).replace(/^\/+/, '')}` : ''}/auth/echo`;
      try {
        const res = await fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store' });
        if (!res.ok) return { ok: false, status: res.status };
        const data = await res.json().catch(() => ({}));
        return { ok: true, status: res.status, data };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    };

    const run = async () => {
      const attempts = [];
      const prefixCandidates = [API_PATH_PREFIX || '/api', '/api', ''];

      let found = null;
      for (const base of candidateBases) {
        for (const prefix of prefixCandidates) {
          const h = await ping(base, prefix);
          attempts.push({ base, prefix, health: h });
          if (h.ok) {
            found = { base, prefix };
            break;
          }
          const e = await tryEcho(base, prefix);
          attempts.push({ base, prefix, echo: e });
          if (e.ok) {
            found = { base, prefix };
            break;
          }
        }
        if (found) break;
      }

      let finalHealth = null;
      let finalEcho = null;
      let resolvedBase = API_BASE_URL;
      let resolvedPrefix = API_PATH_PREFIX || '';

      if (found) {
        resolvedBase = found.base;
        resolvedPrefix = found.prefix;
        finalHealth = attempts.find(
          (a) => a.base === found.base && a.prefix === found.prefix && a.health
        )?.health || null;
        finalEcho = attempts.find(
          (a) => a.base === found.base && a.prefix === found.prefix && a.echo
        )?.echo || null;
      } else {
        finalHealth = await ping(API_BASE_URL, API_PATH_PREFIX || '/api');
        finalEcho = await tryEcho(API_BASE_URL, API_PATH_PREFIX || '/api');
      }

      const note =
        !found
          ? 'No working backend base detected. Check that the backend is running, CORS allows this origin, and ad/tracker blockers are disabled for this site.'
          : 'A working backend base has been found. Consider updating REACT_APP_API_BASE_URL and REACT_APP_API_PATH_PREFIX accordingly.';

      if (!cancelled) {
        setStatus({
          health: finalHealth,
          echo: finalEcho,
          resolvedBase,
          resolvedPrefix,
          attempts,
          note,
          busy: false,
        });
        onResolvedBase && onResolvedBase({ base: resolvedBase, prefix: resolvedPrefix });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [open, candidateBases, onResolvedBase]);

  const row = (label, value) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: '#374151' }}>{label}</span>
      <span style={{ color: '#111827', fontWeight: 600 }}>{value}</span>
    </div>
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Diagnostics panel"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,0.45)',
        zIndex: 50,
        display: 'grid',
        placeItems: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 720,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #eff6ff, #fff)',
          }}
        >
          <div style={{ fontWeight: 800, color: '#1f2937' }}>Connectivity Diagnostics</div>
          <button
            onClick={onClose}
            aria-label="Close diagnostics"
            style={{
              border: 0,
              background: '#fff',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 16 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid #DBEAFE',
              background: '#EFF6FF',
              color: '#1E3A8A',
              marginBottom: 12,
              fontSize: 13,
            }}
          >
            {status.busy ? 'Probing connectivity and fallbacks...' : status.note}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#111827' }}>Resolved Config</div>
              {row('API Base URL', status.resolvedBase || '(relative)')}
              {row('API Path Prefix', status.resolvedPrefix || '(none)')}
              {row('Socket URL (env)', SOCKET_URL || '(not set)')}
              {row('Socket Path', SOCKET_PATH)}
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#111827' }}>Health & Echo</div>
              {row(
                'Health (/health)',
                status.health
                  ? status.health.ok
                    ? `OK (${status.health.status || 200})`
                    : `Fail (${status.health.status || status.health.error || 'error'})`
                  : 'n/a'
              )}
              {row(
                'Echo (/auth/echo)',
                status.echo
                  ? status.echo.ok
                    ? `OK (${status.echo.status || 200})`
                    : `Fail (${status.echo.status || status.echo.error || 'error'})`
                  : 'n/a'
              )}
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#111827' }}>Attempt Log</div>
            <div
              style={{
                maxHeight: 200,
                overflow: 'auto',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: 8,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: 12,
                color: '#111827',
              }}
            >
              {status.attempts.length === 0 ? (
                <div>no attempts yet...</div>
              ) : (
                status.attempts.map((a, i) => (
                  <div key={i} style={{ padding: '2px 0' }}>
                    {`${a.base || '(relative)'} ${a.prefix || '(no prefix)'} -> ${
                      a.health ? `health: ${a.health.ok ? 'OK' : 'FAIL'} ${a.health.status || a.health.error || ''}` :
                      a.echo ? `echo: ${a.echo.ok ? 'OK' : 'FAIL'} ${a.echo.status || a.echo.error || ''}` :
                      'n/a'
                    }`}
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>
            Tips:
            <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 16 }}>
              <li>Set REACT_APP_API_BASE_URL to your backend (e.g., http://localhost:4000).</li>
              <li>Set REACT_APP_API_PATH_PREFIX=/api to avoid ad-blocker heuristics.</li>
              <li>If using a preview proxy, prefer same-origin relative base ('').</li>
              <li>Ensure backend CORS allows this origin (CORS_ORIGIN env on server).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
