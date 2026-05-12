/**
 * WebCrypto-based password hashing for Cloudflare Workers.
 * Uses PBKDF2 with SHA-512, 100,000 iterations, 32-byte salt, 64-byte derived key.
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 32;
const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-512';

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
    { name: ALGORITHM, salt, iterations: ITERATIONS, hash: HASH_ALGORITHM },
    keyMaterial,
    KEY_LENGTH * 8
  );
  const saltBase64 = bufferToBase64(salt);
  const hashBase64 = bufferToBase64(new Uint8Array(derivedBits));
  return `$pbkdf2-sha512$i=${ITERATIONS}$${saltBase64}$${hashBase64}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash.startsWith('$pbkdf2-sha512$')) return false;
  const parts = storedHash.split('$');
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
    { name: ALGORITHM, salt, iterations, hash: HASH_ALGORITHM },
    keyMaterial,
    storedKey.length * 8
  );
  const derivedKey = new Uint8Array(derivedBits);
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
