/**
 * WebCrypto-based password hashing for Cloudflare Workers compatibility.
 * Replaces bcryptjs which uses native bindings that don't work in Workers.
 *
 * Uses PBKDF2 with SHA-512, 100,000 iterations, 32-byte salt, 64-byte derived key.
 * Output format: $pbkdf2-sha512$i=100000$salt$hash (modular crypt format compatible)
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 64; // bytes
const SALT_LENGTH = 32; // bytes
const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-512';

/**
 * Hash a password using PBKDF2-SHA512
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    KEY_LENGTH * 8 // bits
  );

  const saltBase64 = bufferToBase64(salt);
  const hashBase64 = bufferToBase64(new Uint8Array(derivedBits));

  return `$pbkdf2-sha512$i=${ITERATIONS}$${saltBase64}$${hashBase64}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Support both new PBKDF2 format and legacy bcrypt format
  if (storedHash.startsWith('$2')) {
    // Legacy bcrypt format - try bcryptjs if available, otherwise fail
    try {
      const bcrypt = await import('bcryptjs');
      return await bcrypt.compare(password, storedHash);
    } catch {
      console.error('[password] Cannot verify bcrypt hash - bcryptjs not available in this environment');
      return false;
    }
  }

  if (!storedHash.startsWith('$pbkdf2-sha512$')) {
    console.error('[password] Unknown hash format');
    return false;
  }

  const parts = storedHash.split('$');
  // $pbkdf2-sha512$i=100000$salt$hash
  // parts: ['', 'pbkdf2-sha512', 'i=100000', salt, hash]
  if (parts.length < 5) return false;

  const iterations = parseInt(parts[2].split('=')[1], 10);
  const salt = base64ToBuffer(parts[3]);
  const storedKey = base64ToBuffer(parts[4]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: ALGORITHM },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt,
      iterations,
      hash: HASH_ALGORITHM,
    },
    keyMaterial,
    storedKey.length * 8 // bits
  );

  const derivedKey = new Uint8Array(derivedBits);

  // Constant-time comparison
  if (derivedKey.length !== storedKey.length) return false;
  let result = 0;
  for (let i = 0; i < derivedKey.length; i++) {
    result |= derivedKey[i] ^ storedKey[i];
  }
  return result === 0;
}

function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
