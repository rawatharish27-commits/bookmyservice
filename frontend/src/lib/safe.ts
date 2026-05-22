/**
 * Safe array and object access utilities.
 * Prevents .map() crashes when API returns null/undefined.
 *
 * @module safe
 */

/**
 * Ensures a value is always an array.
 * Prevents .map() crashes when API returns null/undefined.
 *
 * @example
 * const items = safeArray(apiResponse.items); // always []
 * items.map(...) // safe
 */
export function safeArray<T>(value: T[] | null | undefined | unknown): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  // If it's an object that might contain an array property, don't wrap it
  return [];
}

/**
 * Safely access a nested property without throwing.
 * Returns defaultValue if any part of the path is null/undefined.
 *
 * @example
 * const city = safeGet(user, 'address.city', 'Unknown');
 * const items = safeGet(response, 'data.items', []);
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue: T): T {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue;
    current = (current as Record<string, unknown>)[key];
  }
  return current === null || current === undefined ? defaultValue : (current as T);
}

/**
 * Safe .map() that never crashes on null/undefined.
 *
 * @example
 * const names = safeMap(users, u => u.name); // always returns []
 */
export function safeMap<T, U>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => U,
): U[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(fn);
}
