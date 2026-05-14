import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { query } from './db.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'
const ISSUER = 'bookyourservice'
const AUDIENCE = 'bookyourservice'
const SECRET = new TextEncoder().encode(JWT_SECRET)

const ROLE_MAP: Record<number, string> = {
  1: 'CLIENT',
  2: 'PROVIDER',
  3: 'ADMIN',
}

export interface UserRecord {
  id: string
  email: string
  phone: string
  name: string
  roleId: number
  status: string
  profileImageUrl?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

export function formatUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    roleId: user.roleId,
    role: ROLE_MAP[user.roleId] || 'CLIENT',
    status: user.status,
    profileImageUrl: user.profileImageUrl || null,
    city: user.city || null,
    state: user.state || null,
    country: user.country || null,
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createAccessToken(user: UserRecord) {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: ROLE_MAP[user.roleId] || 'CLIENT',
    roleId: user.roleId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(SECRET)
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  })
  return payload as JWTPayload
}

export async function getCurrentUser(c: any) {
  const authHeader = c.req.header('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  if (!token) return null

  try {
    const payload = await verifyAccessToken(token)
    const userId = payload.sub
    if (!userId || typeof userId !== 'string') return null

    const result = await query<UserRecord>(
      'SELECT id, email, phone, name, "roleId", status, "profileImageUrl", city, state, country FROM "User" WHERE id = $1',
      [userId]
    )
    return result.rows[0] || null
  } catch (error) {
    return null
  }
}

export async function getUserByEmail(email: string) {
  const result = await query<UserRecord>(
    'SELECT id, email, phone, name, "roleId", status, "profileImageUrl", city, state, country, "passwordHash" FROM "User" WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

export async function getUserById(id: string) {
  const result = await query<UserRecord>(
    'SELECT id, email, phone, name, "roleId", status, "profileImageUrl", city, state, country FROM "User" WHERE id = $1',
    [id]
  )
  return result.rows[0]
}
