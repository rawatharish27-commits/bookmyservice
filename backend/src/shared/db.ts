import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://bookmyservice_user:bookmyservice_password@postgres:5432/bookmyservice',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
})

pool.on('error', (err) => {
  console.error('Unexpected database error', err)
})

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  return pool.query<T>(text, params)
}

export async function getClient() {
  return pool.connect()
}
