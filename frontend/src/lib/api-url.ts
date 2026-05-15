/**
 * Build an API URL with the XTransformPort query parameter for Caddy gateway routing.
 * All API calls must go through the Caddy gateway, which requires XTransformPort=3001
 * to route requests to the backend API service.
 */
export function apiUrl(path: string): string {
  if (!path.startsWith('/api/')) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}XTransformPort=3001`;
}
