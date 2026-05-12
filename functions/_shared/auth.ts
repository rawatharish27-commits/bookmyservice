/**
 * JWT Authentication helpers using jose (WebCrypto-compatible).
 */

import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret(env: { JWT_SECRET?: string }): Uint8Array {
  return new TextEncoder().encode(env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024');
}

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: number;
  role: string;
}

export async function signAccessToken(payload: TokenPayload, env: { JWT_SECRET?: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice-api')
    .sign(getJwtSecret(env));
}

export async function signRefreshToken(payload: TokenPayload, env: { JWT_SECRET?: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice-api')
    .sign(getJwtSecret(env));
}

export async function verifyToken(token: string, env: { JWT_SECRET?: string }): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env), {
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

export async function getAuthUser(request: Request, env: { JWT_SECRET?: string }): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  return verifyToken(token, env);
}

export async function requireAuth(request: Request, env: { JWT_SECRET?: string }): Promise<TokenPayload> {
  const user = await getAuthUser(request, env);
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export function requireRole(user: TokenPayload, ...roles: string[]): boolean {
  return roles.includes(user.role);
}
