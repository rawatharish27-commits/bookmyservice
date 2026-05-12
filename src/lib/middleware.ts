import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export type AuthUser = TokenPayload;

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): Promise<AuthUser> {
  return getAuthUser(request).then((user) => {
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }
    return user;
  });
}

export function requireRole(user: AuthUser, ...roles: string[]): boolean {
  return roles.includes(user.role);
}
