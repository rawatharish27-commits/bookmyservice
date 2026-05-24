export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roleId: number;
  role: string;
}
