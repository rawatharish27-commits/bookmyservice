/**
 * Supabase REST API (PostgREST) client for Cloudflare Workers.
 *
 * Uses fetch() over HTTP since Workers don't support TCP connections.
 * No Node.js-specific APIs are used — only standard Web APIs (fetch, Headers,
 * URLSearchParams, URL, crypto).
 *
 * Usage:
 *   import { createSupabaseClient, Env } from '../_shared/db';
 *   const supabase = createSupabaseClient(env as Env);
 *   const { data, error } = await supabase.from('User').select('*').eq('id', userId);
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Environment variables expected by all Cloudflare Pages Functions. */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  JWT_SECRET: string;
}

/** PostgREST error shape returned by the Supabase REST API. */
export interface PostgrestError {
  message: string;
  code: string;
  details: string | null;
  hint: string | null;
}

/** Standardised result returned by every query / mutation. */
export interface QueryResult<T = unknown> {
  data: T | null;
  error: PostgrestError | null;
  count: number | null;
}

// Internal type for the HTTP method used by a query builder.
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'HEAD';

// ─── QueryBuilder ─────────────────────────────────────────────────────────────

/**
 * Chainable query builder that constructs PostgREST URLs and executes
 * requests via `fetch()`.
 *
 * The builder is *thenable* so you can simply `await` it:
 *
 *   const { data, error } = await supabase.from('users').select('*').eq('id', 1);
 */
export type DbRecord = Record<string, any>;

export class QueryBuilder<T = DbRecord> {
  // Table name
  private readonly _table: string;
  // Base URL (e.g. https://xxx.supabase.co/rest/v1)
  private readonly _baseUrl: string;
  // Headers that will be sent with the request
  private readonly _headers: Headers;
  // HTTP method — defaults to GET (select); changed by insert/update/delete/upsert
  private _method: HttpMethod = 'GET';
  // JSON body for mutations
  private _body: unknown = null;
  // Accumulated query-string parameters
  private readonly _params: URLSearchParams;
  // Whether the consumer requested a single object via .single()
  private _isSingle = false;
  // Whether the consumer requested a maybe-single result
  private _isMaybeSingle = false;
  // Whether the consumer requested an exact count
  private _wantsCount = false;

  constructor(table: string, baseUrl: string, headers: Headers) {
    this._table = table;
    this._baseUrl = baseUrl;
    this._headers = new Headers(headers);
    this._params = new URLSearchParams();
  }

  // ─── Select ──────────────────────────────────────────────────────────────

  /**
   * Start a SELECT query.
   * @param columns Comma-separated column names, or `*` (default). Supports
   *                PostgREST relation syntax: `id,name,category(*)`.
   * @param options Optional — pass `{ count: 'exact' }` to retrieve total count.
   */
  select(columns = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }): this {
    this._method = 'GET';
    this._params.set('select', columns);
    if (options?.count) {
      this._wantsCount = true;
      this._appendPrefer(`count=${options.count}`);
    }
    if (options?.head) {
      this._method = 'HEAD';
    }
    return this;
  }

  // ─── Filters ────────────────────────────────────────────────────────────

  /** Equals: `?col=eq.val` */
  eq(column: string, value: unknown): this {
    this._params.append(column, `eq.${this._encode(value)}`);
    return this;
  }

  /** Not-equals: `?col=neq.val` */
  neq(column: string, value: unknown): this {
    this._params.append(column, `neq.${this._encode(value)}`);
    return this;
  }

  /** Greater-than: `?col=gt.val` */
  gt(column: string, value: unknown): this {
    this._params.append(column, `gt.${this._encode(value)}`);
    return this;
  }

  /** Greater-than-or-equal: `?col=gte.val` */
  gte(column: string, value: unknown): this {
    this._params.append(column, `gte.${this._encode(value)}`);
    return this;
  }

  /** Less-than: `?col=lt.val` */
  lt(column: string, value: unknown): this {
    this._params.append(column, `lt.${this._encode(value)}`);
    return this;
  }

  /** Less-than-or-equal: `?col=lte.val` */
  lte(column: string, value: unknown): this {
    this._params.append(column, `lte.${this._encode(value)}`);
    return this;
  }

  /** Case-sensitive LIKE: `?col=like.%pattern%` */
  like(column: string, pattern: string): this {
    this._params.append(column, `like.${pattern}`);
    return this;
  }

  /** Case-insensitive ILIKE: `?col=ilike.%pattern%` */
  ilike(column: string, pattern: string): this {
    this._params.append(column, `ilike.${pattern}`);
    return this;
  }

  /** IN list: `?col=in.(val1,val2,val3)` */
  in(column: string, values: unknown[]): this {
    const encoded = values.map((v) => String(v)).join(',');
    this._params.append(column, `in.(${encoded})`);
    return this;
  }

  /** IS filter — used for `null`, `true`, `false`: `?col=is.null` */
  is(column: string, value: unknown): this {
    this._params.append(column, `is.${value}`);
    return this;
  }

  /**
   * OR filter — groups conditions with OR.
   * @param conditions Comma-separated PostgREST conditions, e.g. `title.ilike.%term%,description.ilike.%term%`
   * Produces `?or=(title.ilike.%term%,description.ilike.%term%)`
   */
  or(conditions: string): this {
    this._params.append('or', `(${conditions})`);
    return this;
  }

  // ─── Ordering ──────────────────────────────────────────────────────────

  /**
   * Order results.
   * @param column   Column to order by.
   * @param options  `ascending` (default true), `nullsFirst`.
   */
  order(column: string, options: { ascending?: boolean; nullsFirst?: boolean } = {}): this {
    const { ascending = true, nullsFirst } = options;
    const dir = ascending ? 'asc' : 'desc';
    let orderVal = `${column}.${dir}`;
    if (nullsFirst !== undefined) {
      orderVal += nullsFirst ? '.nullsfirst' : '.nullslast';
    }
    // Append so multiple .order() calls stack correctly
    const existing = this._params.get('order');
    if (existing) {
      this._params.set('order', `${existing},${orderVal}`);
    } else {
      this._params.set('order', orderVal);
    }
    return this;
  }

  // ─── Pagination ─────────────────────────────────────────────────────────

  /** Limit the number of rows returned. */
  limit(count: number): this {
    this._params.set('limit', String(count));
    return this;
  }

  /**
   * Limit + offset-based pagination range (inclusive).
   * `range(0, 9)` → `offset=0&limit=10`
   */
  range(from: number, to: number): this {
    this._params.set('offset', String(from));
    this._params.set('limit', String(to - from + 1));
    return this;
  }

  // ─── Single-row helpers ────────────────────────────────────────────────

  /**
   * Expect exactly one row.
   * Returns the row as a plain object (not an array).
   * If zero or more-than-one rows are found, PostgREST returns an error.
   */
  single(): this {
    this._isSingle = true;
    this._headers.set('Accept', 'application/vnd.pgrst.object+json');
    return this;
  }

  /**
   * Return at most one row as a plain object, or `null` if none match.
   * Internally fetches as a single object and gracefully handles the "0 rows"
   * PostgREST error (PGRST116).
   */
  maybeSingle(): this {
    this._isMaybeSingle = true;
    this._headers.set('Accept', 'application/vnd.pgrst.object+json');
    return this;
  }

  // ─── Mutations ─────────────────────────────────────────────────────────

  /**
   * INSERT rows.  By default the inserted rows are returned
   * (`Prefer: return=representation`).
   *
   * You can chain `.select('id,name')` after insert to choose which columns
   * come back, just like the official Supabase client.
   */
  insert(data: unknown): this {
    this._method = 'POST';
    this._body = data;
    this._appendPrefer('return=representation');
    return this;
  }

  /**
   * UPDATE rows.  **Must** be paired with at least one filter (e.g. `.eq()`).
   * Returns the updated rows by default.
   */
  update(data: unknown): this {
    this._method = 'PATCH';
    this._body = data;
    this._appendPrefer('return=representation');
    return this;
  }

  /**
   * DELETE rows.  **Must** be paired with at least one filter.
   * Returns the deleted rows by default.
   */
  delete(): this {
    this._method = 'DELETE';
    this._appendPrefer('return=representation');
    return this;
  }

  /**
   * UPSERT — insert the row or update it if a conflict exists on the
   * primary key / unique constraint.
   * Returns the upserted rows by default.
   */
  upsert(data: unknown): this {
    this._method = 'POST';
    this._body = data;
    this._appendPrefer('resolution=merge-duplicates,return=representation');
    return this;
  }

  // ─── Execute ───────────────────────────────────────────────────────────

  /** Build the URL and fire the HTTP request. */
  async execute(): Promise<QueryResult<T>> {
    const qs = this._params.toString();
    const url = `${this._baseUrl}/${this._table}${qs ? '?' + qs : ''}`;

    const init: RequestInit = {
      method: this._method,
      headers: this._headers,
    };

    if (this._body !== null) {
      init.body = JSON.stringify(this._body);
    }

    try {
      const response = await fetch(url, init);

      // ── Count from content-range header ──
      let count: number | null = null;
      const contentRange = response.headers.get('content-range');
      if (contentRange) {
        const slashIdx = contentRange.lastIndexOf('/');
        if (slashIdx >= 0) {
          const totalPart = contentRange.slice(slashIdx + 1);
          if (totalPart !== '*') {
            count = parseInt(totalPart, 10);
          }
        }
      }

      // ── Error handling ──
      if (!response.ok) {
        let pgError: PostgrestError;
        try {
          const body = (await response.json()) as Record<string, unknown>;
          pgError = {
            message: String(body.message ?? body.msg ?? body.error ?? 'Unknown error'),
            code: String(body.code ?? response.status),
            details: body.details != null ? String(body.details) : null,
            hint: body.hint != null ? String(body.hint) : null,
          };

          // maybeSingle: a "0 rows" error is not an error — return null data
          if (
            this._isMaybeSingle &&
            pgError.code === 'PGRST116'
          ) {
            return { data: null, error: null, count };
          }
        } catch {
          pgError = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            code: String(response.status),
            details: null,
            hint: null,
          };
        }
        return { data: null, error: pgError, count };
      }

      // ── No Content (e.g. DELETE without representation) ──
      if (response.status === 204) {
        return { data: null, error: null, count };
      }

      // ── Parse JSON ──
      const data = (await response.json()) as T;

      // maybeSingle: if PostgREST returned an array (shouldn't with the Accept
      // header, but guard anyway), unwrap it
      if (this._isMaybeSingle && Array.isArray(data) && data.length === 0) {
        return { data: null, error: null, count };
      }

      return { data, error: null, count };
    } catch (err) {
      return {
        data: null,
        error: {
          message: (err as Error).message ?? 'Network error',
          code: 'NETWORK_ERROR',
          details: null,
          hint: null,
        },
        count: null,
      };
    }
  }

  // ─── Thenable interface (enables `await builder`) ─────────────────────

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<QueryResult<T> | TResult> {
    return this.execute().catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<QueryResult<T>> {
    return this.execute().finally(onfinally);
  }

  // ─── Private helpers ──────────────────────────────────────────────────

  /** Encode a value for PostgREST filter syntax. */
  private _encode(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  /**
   * Append a directive to the `Prefer` header.
   * Multiple directives are comma-separated:
   *   `Prefer: return=representation,count=exact`
   */
  private _appendPrefer(directive: string): void {
    const existing = this._headers.get('Prefer');
    if (existing) {
      this._headers.set('Prefer', `${existing},${directive}`);
    } else {
      this._headers.set('Prefer', directive);
    }
  }
}

// ─── SupabaseClient ──────────────────────────────────────────────────────────

/**
 * Lightweight Supabase REST API client.
 *
 * Uses the `service_role` key so all operations bypass Row-Level Security (RLS).
 * Only standard Web APIs are used — safe for Cloudflare Workers.
 */
export class SupabaseClient {
  private readonly _url: string;
  private readonly _serviceKey: string;
  private readonly _baseUrl: string;
  private readonly _defaultHeaders: Headers;

  constructor(url: string, serviceKey: string) {
    this._url = url;
    this._serviceKey = serviceKey;
    this._baseUrl = `${url}/rest/v1`;
    this._defaultHeaders = new Headers({
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    });
  }

  /**
   * Start building a query against a table / view.
   *
   *   const { data, error } = await supabase.from('User').select('*').eq('id', 1);
   */
  from<T = DbRecord>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table, this._baseUrl, this._defaultHeaders);
  }

  /**
   * Call a PostgreSQL function (RPC) via PostgREST.
   *
   *   const { data, error } = await supabase.rpc('search_services', { query: 'plumber' });
   */
  async rpc<T = unknown>(
    functionName: string,
    params?: Record<string, unknown>,
  ): Promise<QueryResult<T>> {
    const url = `${this._baseUrl}/rpc/${functionName}`;
    const headers = new Headers(this._defaultHeaders);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: params ? JSON.stringify(params) : '{}',
      });

      if (!response.ok) {
        let pgError: PostgrestError;
        try {
          const body = (await response.json()) as Record<string, unknown>;
          pgError = {
            message: String(body.message ?? body.msg ?? body.error ?? 'Unknown error'),
            code: String(body.code ?? response.status),
            details: body.details != null ? String(body.details) : null,
            hint: body.hint != null ? String(body.hint) : null,
          };
        } catch {
          pgError = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            code: String(response.status),
            details: null,
            hint: null,
          };
        }
        return { data: null, error: pgError, count: null };
      }

      // 204 No Content
      if (response.status === 204) {
        return { data: null, error: null, count: null };
      }

      const data = (await response.json()) as T;
      return { data, error: null, count: null };
    } catch (err) {
      return {
        data: null,
        error: {
          message: (err as Error).message ?? 'Network error',
          code: 'NETWORK_ERROR',
          details: null,
          hint: null,
        },
        count: null,
      };
    }
  }

  /** The raw Supabase project URL (e.g. `https://xxx.supabase.co`). */
  get url(): string {
    return this._url;
  }
}

// ─── Factory helper ──────────────────────────────────────────────────────────

/**
 * Create a SupabaseClient from the environment object.
 *
 *   const supabase = createSupabaseClient(env);
 */
export function createSupabaseClient(env: Env): SupabaseClient {
  return new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
}
