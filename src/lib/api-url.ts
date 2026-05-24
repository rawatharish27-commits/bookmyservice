/**
 * Build an API URL for the Next.js app.
 * Since this Next.js app has its own API routes, no port transformation is needed.
 */
export function apiUrl(path: string): string {
  return path;
}
