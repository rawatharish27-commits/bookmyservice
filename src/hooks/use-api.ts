import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function useApi<T>(url: string | null, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const optionsRef = useRef(options);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(optionsRef.current?.headers as Record<string, string>),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { ...optionsRef.current, headers });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Request failed');
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!url) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(optionsRef.current?.headers as Record<string, string>),
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(url, { ...optionsRef.current, headers });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Request failed');
        }
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [url, token]);

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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { ...options, headers });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Request failed');
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
