import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Lazily resolves JWT_SECRET so the module can be imported at build time
 * (when env vars are not available) without throwing. The secret is validated
 * the first time a signing/verification function is actually called at runtime.
 */
let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (!_jwtSecret) {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is required in production. Set it before starting the server.'
      );
    }
    _jwtSecret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'bys-dev-secret-key-change-in-production-2024'
    );
  }
  return _jwtSecret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: number;
  role: string;
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice')
    .sign(getJwtSecret());
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer('bookyourservice')
    .setAudience('bookyourservice')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'bookyourservice',
      audience: 'bookyourservice',
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
