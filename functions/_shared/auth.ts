import { Env, JwtPayload } from '../types';

export async function signToken(payload: JwtPayload, secret: string, expiry: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = expiry === '15m' ? now + 900 : now + 604800; // 15 min or 7 days

  const payloadObj = { ...payload, iat: now, exp, iss: 'bookyourservice', aud: 'bookyourservice-api' };

  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payloadObj));
  const data = encoder.encode(`${headerB64}.${payloadB64}`);

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));

    const valid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.iss !== 'bookyourservice' || payload.aud !== 'bookyourservice-api') return null;

    return {
      userId: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: Request, secret: string): Promise<JwtPayload> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  const token = authHeader.substring(7);
  const payload = await verifyToken(token, secret);
  if (!payload) {
    throw new Error('UNAUTHORIZED');
  }
  return payload;
}
