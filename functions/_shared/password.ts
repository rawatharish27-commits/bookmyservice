/**
 * Password hashing & verification for Cloudflare Workers.
 *
 * Supports two hash formats:
 *   1. **PBKDF2** (`$pbkdf2-sha512$...`) — WebCrypto-based, used for new hashes
 *   2. **bcrypt** (`$2a$...` / `$2b$...`) — Pure-JS implementation via `bcryptjs`,
 *      supported for *verification only* to allow migration from PostgreSQL
 *      databases where the admin password was originally hashed with bcrypt.
 *
 * `hashPassword()` always produces a PBKDF2 hash.
 * `verifyPassword()` auto-detects the format and verifies accordingly.
 */

import * as bcryptjs from 'bcryptjs';

// ─── PBKDF2 constants ─────────────────────────────────────────────────────────

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;
const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-512';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Hash a password using PBKDF2-SHA512.
 * The resulting string has the format: `$pbkdf2-sha512$i=100000$<salt>$<hash>`
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations: ITERATIONS, hash: HASH_ALGORITHM },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  const saltBase64 = bufferToBase64(salt);
  const hashBase64 = bufferToBase64(new Uint8Array(derivedBits));
  return `$pbkdf2-sha512$i=${ITERATIONS}$${saltBase64}$${hashBase64}`;
}

/**
 * Verify a password against a stored hash.
 *
 * Supports:
 *   - PBKDF2 hashes (`$pbkdf2-sha512$...`)
 *   - bcrypt hashes (`$2a$...`, `$2b$...`, `$2y$...`)
 *
 * The hash format is auto-detected from the prefix.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // ─── PBKDF2 path ─────────────────────────────────────────────────────────
  if (storedHash.startsWith('$pbkdf2-sha512$')) {
    return verifyPbkdf2(password, storedHash);
  }

  // ─── bcrypt path ─────────────────────────────────────────────────────────
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcryptjs.compareSync(password, storedHash);
  }

  // Unknown format
  return false;
}

// ─── PBKDF2 verification (internal) ──────────────────────────────────────────

async function verifyPbkdf2(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  // Format: $pbkdf2-sha512$i=100000$salt$hash  → parts = ['', 'pbkdf2-sha512', 'i=100000', 'salt', 'hash']
  if (parts.length < 5) return false;

  const iterations = parseInt(parts[2].split('=')[1], 10);
  const salt = base64ToBuffer(parts[3]);
  const storedKey = base64ToBuffer(parts[4]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: ALGORITHM, salt, iterations, hash: HASH_ALGORITHM },
    keyMaterial,
    storedKey.length * 8,
  );
  const derivedKey = new Uint8Array(derivedBits);

  if (derivedKey.length !== storedKey.length) return false;

  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < derivedKey.length; i++) {
    result |= derivedKey[i] ^ storedKey[i];
  }
  return result === 0;
}

// ─── Base64 helpers ───────────────────────────────────────────────────────────

function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}
