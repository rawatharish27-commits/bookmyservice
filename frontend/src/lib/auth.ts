import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key' : (() => { throw new Error('JWT_SECRET environment variable is required in production') })())
);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: number;
  role: string;
}

// ---------------------------------------------------------------------------
// Original server-side JWT functions (unchanged)
// ---------------------------------------------------------------------------

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice-api')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice-api')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'bookyourservice',
      audience: 'bookyourservice-api',
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      roleId: payload.roleId as number,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie strategy helpers (client-side)
// ---------------------------------------------------------------------------

const REFRESH_TOKEN_COOKIE = 'bys_refresh_token';

/**
 * Parse cookies from a cookie string (works with document.cookie or Set-Cookie header).
 * Returns a Map of cookie name → cookie value.
 */
export function parseCookies(cookieString: string): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!cookieString) return cookies;

  const pairs = cookieString.split(';');
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const name = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    cookies.set(name, decodeURIComponent(value));
  }
  return cookies;
}

/**
 * Read a specific cookie from document.cookie (browser only).
 * Returns the cookie value or null if not found.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = parseCookies(document.cookie);
  return cookies.get(name) ?? null;
}

/**
 * Read a specific cookie from a Request object's Cookie header.
 * Returns the cookie value or null if not found.
 */
export function getCookieFromRequest(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookies = parseCookies(cookieHeader);
  return cookies.get(name) ?? null;
}

/**
 * Extract the refresh token from cookies (browser).
 * Note: The bys_refresh_token cookie is HttpOnly, so it won't be accessible
 * via document.cookie in browser. This function is primarily useful for
 * SSR/middleware contexts where the cookie header is available.
 */
export function getRefreshTokenFromCookies(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE);
}

/**
 * Extract the refresh token from a Request's cookies (SSR/middleware).
 */
export function getRefreshTokenFromRequest(request: Request): string | null {
  return getCookieFromRequest(request, REFRESH_TOKEN_COOKIE);
}

/**
 * Check if the bys_refresh_token cookie exists (browser).
 * Note: HttpOnly cookies are not readable via document.cookie.
 * This will only work for non-HttpOnly cookies or in SSR context.
 */
export function hasRefreshCookie(): boolean {
  return getRefreshTokenFromCookies() !== null;
}

/**
 * Check if the bys_refresh_token cookie exists in a Request (SSR/middleware).
 */
export function hasRefreshCookieInRequest(request: Request): boolean {
  return getRefreshTokenFromRequest(request) !== null;
}

// ---------------------------------------------------------------------------
// JWT decode without verification (client-side helpers)
// ---------------------------------------------------------------------------

/**
 * Decoded JWT payload structure (client-side, without verification).
 * Only use this for non-security-critical operations like checking expiry.
 */
export interface DecodedTokenPayload {
  userId?: string;
  email?: string;
  roleId?: number;
  role?: string;
  iss?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  jti?: string;
  [key: string]: unknown;
}

/**
 * Decode a JWT payload without verifying the signature.
 * This is safe for client-side expiry checks but MUST NOT be used
 * for any security-critical decision (always use verifyToken for that).
 *
 * Returns null if the token is malformed.
 */
export function decodeTokenPayload(token: string): DecodedTokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const payloadB64 = parts[1];
    // Handle base64url encoding
    const padded = payloadB64
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded);

    return payload as DecodedTokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token expiry helpers (client-side)
// ---------------------------------------------------------------------------

/** Threshold in seconds — if token expires within this window, consider it "expiring soon" */
const DEFAULT_EXPIRY_THRESHOLD_SECONDS = 120; // 2 minutes

/**
 * Get the expiry timestamp (in seconds since epoch) of a JWT.
 * Returns null if the token is malformed or has no exp claim.
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeTokenPayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp;
}

/**
 * Check if a token is about to expire.
 *
 * @param token - The JWT string
 * @param thresholdSeconds - How many seconds before expiry to consider "soon" (default: 120s / 2 min)
 * @returns true if the token will expire within the threshold, or is already expired
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = DEFAULT_EXPIRY_THRESHOLD_SECONDS
): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true; // Can't decode → treat as expiring
  const now = Math.floor(Date.now() / 1000);
  return expiry - now < thresholdSeconds;
}

/**
 * Check if a token is already expired.
 * Returns true if the token is expired or malformed (fail-closed).
 */
export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return Math.floor(Date.now() / 1000) >= expiry;
}

/**
 * Get the number of seconds remaining until the token expires.
 * Returns 0 if the token is already expired or malformed.
 */
export function getTokenTimeToLive(token: string): number {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return 0;
  const remaining = expiry - Math.floor(Date.now() / 1000);
  return Math.max(0, remaining);
}

// ---------------------------------------------------------------------------
// Client-side token invalidation blacklist (in-memory Set with TTL)
// ---------------------------------------------------------------------------

interface BlacklistEntry {
  hash: string;
  expiresAt: number; // timestamp in ms
}

/** In-memory blacklist with TTL. Entries are cleaned up lazily. */
const tokenBlacklist = new Map<string, BlacklistEntry>();

/** Default TTL for blacklisted tokens: 20 minutes (matches access token lifetime + buffer) */
const BLACKLIST_DEFAULT_TTL_MS = 20 * 60 * 1000;

/** Maximum blacklist size to prevent memory leaks */
const BLACKLIST_MAX_SIZE = 1000;

/**
 * Generate a simple hash for a token or JTI string.
 * Uses a fast, non-cryptographic hash for in-memory lookup.
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Lazily purge expired entries from the blacklist.
 * Called on every check/invalidate to keep memory bounded.
 */
function purgeExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of tokenBlacklist) {
    if (entry.expiresAt <= now) {
      tokenBlacklist.delete(key);
    }
  }
}

/**
 * Check if a token (by its JTI or raw token hash) has been invalidated.
 *
 * This is a CLIENT-SIDE check only — it complements the server-side blacklist
 * by preventing the client from even attempting to use a known-invalid token.
 * The server must still perform its own blacklist verification.
 *
 * @param jtiOrTokenHash - The JWT's jti claim, or the raw token string (will be hashed)
 * @returns true if the token has been client-side invalidated
 */
export function isTokenInvalidated(jtiOrTokenHash: string): boolean {
  purgeExpiredEntries();
  const key = simpleHash(jtiOrTokenHash);
  return tokenBlacklist.has(key);
}

/**
 * Invalidate a token on the client side.
 *
 * This should be called when:
 * - The server rejects a token (401 after refresh failure)
 * - The user explicitly logs out (before the server call completes)
 * - A token rotation happens and the old token should no longer be used
 *
 * @param jtiOrTokenHash - The JWT's jti claim, or the raw token string (will be hashed)
 * @param ttlMs - How long to keep this entry in the blacklist (default: 20 minutes)
 */
export function invalidateToken(jtiOrTokenHash: string, ttlMs: number = BLACKLIST_DEFAULT_TTL_MS): void {
  purgeExpiredEntries();

  // Enforce max size — if at capacity, remove the oldest entry
  if (tokenBlacklist.size >= BLACKLIST_MAX_SIZE) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of tokenBlacklist) {
      if (entry.expiresAt < oldestTime) {
        oldestTime = entry.expiresAt;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      tokenBlacklist.delete(oldestKey);
    }
  }

  const key = simpleHash(jtiOrTokenHash);
  tokenBlacklist.set(key, {
    hash: key,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidate a token by decoding it and using its JTI, or falling back to
 * hashing the raw token. Convenience wrapper around invalidateToken().
 */
export function invalidateAccessToken(token: string, ttlMs?: number): void {
  const payload = decodeTokenPayload(token);
  // Prefer JTI if available; otherwise hash the raw token
  const identifier = payload?.jti ?? token;
  invalidateToken(identifier, ttlMs);
}

/**
 * Check if an access token is invalidated by decoding and checking its JTI,
 * or falling back to hashing the raw token. Convenience wrapper around isTokenInvalidated().
 */
export function isAccessTokenInvalidated(token: string): boolean {
  const payload = decodeTokenPayload(token);
  const identifier = payload?.jti ?? token;
  return isTokenInvalidated(identifier);
}

/**
 * Clear the entire client-side token blacklist.
 * Useful for testing or when the user fully logs out.
 */
export function clearTokenBlacklist(): void {
  tokenBlacklist.clear();
}

/**
 * Get the current size of the client-side token blacklist (for debugging/monitoring).
 */
export function getTokenBlacklistSize(): number {
  purgeExpiredEntries();
  return tokenBlacklist.size;
}
