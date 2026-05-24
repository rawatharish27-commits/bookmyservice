/**
 * ─── Tracking Service — JWT Authentication ──────────────────────────────
 *
 * JWT verification for Socket.IO connections.
 * Uses the jose library for JWT verification with the shared secret.
 */

import { jwtVerify } from 'jose'
import { JWT_SECRET } from './config'

export interface AuthPayload {
  sub: string        // userId
  email: string
  role: string       // CLIENT, PROVIDER, TECHNICIAN, ADMIN, etc.
  roleId: number     // 1=CLIENT, 2=PROVIDER, 3=ADMIN, 4=TECHNICIAN, etc.
}

/**
 * Verify a JWT token and return the decoded payload.
 * Returns null if verification fails.
 */
export async function verifySocketToken(token: string): Promise<AuthPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'bookyourservice',
      audience: 'bookyourservice',
    })
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      roleId: payload.roleId as number,
    }
  } catch (err: any) {
    console.warn('🔐 JWT verification failed:', err.code || err.message)
    return null
  }
}
