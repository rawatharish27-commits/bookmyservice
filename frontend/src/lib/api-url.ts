/**
 * Build an API URL for the backend.
 *
 * When VITE_API_URL is set (e.g. on Vercel → Render), prepend that base URL.
 * Otherwise (local dev), use relative path which Vite proxy or Caddy gateway handles.
 */
const API_BASE = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  if (!path.startsWith('/api/')) return path;

  // Deployed: full URL to Render backend
  if (API_BASE) {
    return `${API_BASE}${path}`;
  }

  return path;
}
