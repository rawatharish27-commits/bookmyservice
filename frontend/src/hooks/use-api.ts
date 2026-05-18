import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiUrl } from '@/lib/api-url';

export function useApi<T>(url: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(url !== null); // N9 fix — initial loading based on url
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const optionsRef = useRef(options);
  const cancelledRef = useRef(false);

  // N15 fix — keep optionsRef in sync with options prop
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const isFormData = optionsRef.current?.body instanceof FormData;
      const headers: Record<string, string> = {
        ...(optionsRef.current?.headers as Record<string, string>),
      };
      // Only set Content-Type for non-FormData bodies (browser sets boundary automatically for FormData)
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(apiUrl(url), { ...optionsRef.current, headers });
      // Handle 204 No Content responses
      if (res.status === 204) {
        if (!cancelledRef.current) setData(null as unknown as T);
        return;
      }
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Request failed');
      }
      // Guard: ensure result is an object (not null/undefined)
      if (result === null || result === undefined) {
        if (!cancelledRef.current) setData(null as unknown as T)
        return
      }
      if (!cancelledRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [url, token]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchData();
    return () => { cancelledRef.current = true; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const mutate = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);
    try {
      const isFormData = options.body instanceof FormData;
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      // Only set Content-Type for non-FormData bodies
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(apiUrl(url), { ...options, headers });
      // Handle 204 No Content responses
      if (res.status === 204) {
        return null;
      }
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Request failed');
      }
      // Guard: ensure result is an object (not null/undefined)
      if (result === null || result === undefined) {
        return null
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { mutate, loading, error };
}
