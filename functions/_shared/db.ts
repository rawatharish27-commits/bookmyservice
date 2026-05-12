/**
 * D1 Database helpers for Cloudflare Pages Functions.
 * All queries use parameterized statements to prevent SQL injection.
 */

export async function query(db: D1Database, sql: string, params: unknown[] = []): Promise<unknown[]> {
  const result = await db.prepare(sql).bind(...params).all();
  return result.results as unknown[];
}

export async function queryOne(db: D1Database, sql: string, params: unknown[] = []): Promise<unknown | null> {
  return db.prepare(sql).bind(...params).first();
}

export async function execute(db: D1Database, sql: string, params: unknown[] = []): Promise<D1Result> {
  return db.prepare(sql).bind(...params).run();
}

export async function batch<T extends unknown[]>(db: D1Database, stmts: Promise<D1Result>[]): Promise<T> {
  return db.batch(stmts) as Promise<T>;
}
