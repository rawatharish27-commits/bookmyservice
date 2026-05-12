export async function query(db: D1Database, sql: string, params?: any[]): Promise<any[]> {
  const result = await db.prepare(sql).bind(...(params || [])).all();
  return result.results as any[];
}

export async function queryOne(db: D1Database, sql: string, params?: any[]): Promise<any | null> {
  const result = await db.prepare(sql).bind(...(params || [])).first();
  return result as any | null;
}

export async function execute(db: D1Database, sql: string, params?: any[]): Promise<D1Result> {
  return db.prepare(sql).bind(...(params || [])).run();
}
