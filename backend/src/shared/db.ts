import { Pool, QueryResult } from 'pg'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://bookmyservice_user:bookmyservice_password@postgres:5432/bookmyservice',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  console.error('Unexpected database error', err)
})

export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}

export async function getClient() {
  return pool.connect()
}
