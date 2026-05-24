/**
 * Type declarations for Cloudflare Pages Functions.
 * Provides the EventContext type used by all function handlers.
 */

interface EventContext<Env = Record<string, unknown>, Params = Record<string, string>, Data = unknown> {
  request: Request;
  env: Env;
  params: Params;
  data: Data;
  next: () => Promise<Response>;
  functionPath: string;
}
