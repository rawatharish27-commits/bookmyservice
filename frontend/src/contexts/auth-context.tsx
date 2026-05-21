import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { apiUrl } from '@/lib/api-url';

export interface TechnicianProfile {
  id: string;
  specialization: string;
  experienceYears: number;
  certifications: string[];
  availabilityStatus: 'available' | 'busy' | 'offline';
  rating: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  roleId?: number;
  role: string;
  status: string;
  profileImageUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isVerified?: boolean;
  verifiedBadge?: boolean;
  completedJobsCount?: number;
  referralCode?: string;
  kycStatus?: 'pending' | 'submitted' | 'verified' | 'rejected' | 'not_started';
  technicianProfile?: TechnicianProfile | null;
  walletBalance?: number;
  createdAt?: string;
}

// Role ID constants for the multi-role system
export const ROLE_IDS = {
  CLIENT: 1,
  PROVIDER: 2,
  ADMIN: 3,
  TECHNICIAN: 4,
  VENDOR: 5,
  FRANCHISE: 6,
  SUB_ADMIN: 7,
  AREA_MANAGER: 8,
  MANAGER: 9,
  LOCAL_ADMIN: 10,
} as const;

export type RoleName = keyof typeof ROLE_IDS;

// Map roleId to role string
export const ROLE_MAP: Record<number, string> = {
  [ROLE_IDS.CLIENT]: 'CLIENT',
  [ROLE_IDS.PROVIDER]: 'PROVIDER',
  [ROLE_IDS.ADMIN]: 'ADMIN',
  [ROLE_IDS.TECHNICIAN]: 'TECHNICIAN',
  [ROLE_IDS.VENDOR]: 'VENDOR',
  [ROLE_IDS.FRANCHISE]: 'FRANCHISE',
  [ROLE_IDS.SUB_ADMIN]: 'SUB_ADMIN',
  [ROLE_IDS.AREA_MANAGER]: 'AREA_MANAGER',
  [ROLE_IDS.MANAGER]: 'MANAGER',
  [ROLE_IDS.LOCAL_ADMIN]: 'LOCAL_ADMIN',
};

// Map role string to roleId (reverse lookup)
export const ROLE_ID_MAP: Record<string, number> = {
  CLIENT: ROLE_IDS.CLIENT,
  PROVIDER: ROLE_IDS.PROVIDER,
  ADMIN: ROLE_IDS.ADMIN,
  TECHNICIAN: ROLE_IDS.TECHNICIAN,
  VENDOR: ROLE_IDS.VENDOR,
  FRANCHISE: ROLE_IDS.FRANCHISE,
  SUB_ADMIN: ROLE_IDS.SUB_ADMIN,
  AREA_MANAGER: ROLE_IDS.AREA_MANAGER,
  MANAGER: ROLE_IDS.MANAGER,
  LOCAL_ADMIN: ROLE_IDS.LOCAL_ADMIN,
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  socialLogin: (authToken: string, userData: User) => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  name: string;
  roleId: number;
  role?: string;
  specialization?: string;
}

// Sensitive fields that should never be stored in localStorage
const SENSITIVE_FIELDS = ['passwordHash', 'resetToken', 'resetTokenExpiry', 'password', 'token', 'bankAccountNumber', 'ifscCode', 'upiId'] as const;

function sanitizeUser(user: User | null): User | null {
  if (!user) return null;
  const sanitized = { ...user };
  for (const field of SENSITIVE_FIELDS) {
    delete (sanitized as Record<string, unknown>)[field];
  }
  return sanitized;
}

// Retry with exponential backoff for network errors only
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      // Only retry on network errors, not HTTP errors
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Token stored in-memory ONLY (not localStorage - prevents XSS token theft)
  const [token, setToken] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  // User data can be stored in localStorage (not a security risk)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('bys_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    // If there's a stored user, we need to verify/refresh on mount
    try {
      const saved = localStorage.getItem('bys_user');
      return !!saved;
    } catch {
      return false;
    }
  });

  // Track if we're currently refreshing to prevent concurrent refreshes
  const isRefreshingRef = useRef(false);
  const pendingRefreshPromiseRef = useRef<Promise<string | null> | null>(null);

  // Keep tokenRef in sync
  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    tokenRef.current = newToken;
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current && pendingRefreshPromiseRef.current) {
      return pendingRefreshPromiseRef.current;
    }

    isRefreshingRef.current = true;
    pendingRefreshPromiseRef.current = (async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include', // Send HttpOnly cookie
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          // Refresh failed - clear auth state
          updateToken(null);
          setUser(null);
          localStorage.removeItem('bys_user');
          return null;
        }

        const data = await res.json();
        if (data.accessToken) {
          updateToken(data.accessToken);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
        }
        return data.accessToken;
      } catch (err) {
        // Network error during refresh - don't logout, just return null
        console.warn('Token refresh failed (network error):', err);
        return null;
      } finally {
        isRefreshingRef.current = false;
        pendingRefreshPromiseRef.current = null;
      }
    })();

    return pendingRefreshPromiseRef.current;
  }, [updateToken]);

  // Centralized auth-aware fetch with automatic token refresh on 401
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = tokenRef.current;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Add refresh token header for logout
    if (url.includes('/api/auth/logout')) {
      headers['X-Refresh-Token'] = 'auto'; // Backend reads from cookie
    }

    const fullUrl = apiUrl(url);

    let res = await fetchWithRetry(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Always send cookies
    });

    // If 401 and we have a token, try to refresh and retry once
    if (res.status === 401 && currentToken) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetchWithRetry(fullUrl, {
          ...options,
          headers,
          credentials: 'include',
        });
      } else {
        // Refresh failed, clear auth
        updateToken(null);
        setUser(null);
        localStorage.removeItem('bys_user');
      }
    }

    return res;
  }, [refreshAccessToken, updateToken]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const authToken = data.accessToken || data.token;
      if (authToken) {
        updateToken(authToken);
        setUser(data.user);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
        // Don't store token in localStorage anymore!
      } else {
        throw new Error('No token received');
      }
    } finally {
      setLoading(false);
    }
  }, [updateToken]);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      // Map roleId to role string for the API, supporting all new roles
      // Include specialization if provided
      const payload = {
        ...data,
        roleId: data.roleId || 1,
        role: data.role || ROLE_MAP[data.roleId] || 'CLIENT',
      };
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');
      const authToken = result.accessToken || result.token;
      if (authToken) {
        updateToken(authToken);
        setUser(result.user);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(result.user)));
      } else {
        throw new Error('No token received');
      }
    } finally {
      setLoading(false);
    }
  }, [updateToken]);

  const logout = useCallback(async () => {
    const currentToken = tokenRef.current;
    try {
      // Call backend to invalidate tokens (fire-and-forget with a short timeout)
      if (currentToken) {
        await fetch(apiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'X-Refresh-Token': 'auto',
          },
          credentials: 'include',
        }).catch(() => { /* ignore */ });
      }
    } finally {
      updateToken(null);
      setUser(null);
      localStorage.removeItem('bys_user');
      localStorage.removeItem('bys_token'); // Clean up old token if present
    }
  }, [updateToken]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    const res = await authFetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    setUser(data.user);
    localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
  }, [authFetch]);

  const refreshProfile = useCallback(async () => {
    if (!tokenRef.current) return;
    setLoading(true);
    try {
      const res = await authFetch('/api/auth/profile', {
        headers: {},
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
        // The profile endpoint returns a fresh access token
        if (data.accessToken) {
          updateToken(data.accessToken);
        }
      } else if (res.status === 401) {
        // Try refresh token flow
        const newToken = await refreshAccessToken();
        if (!newToken) {
          updateToken(null);
          setUser(null);
          localStorage.removeItem('bys_user');
        }
      }
    } catch {
      // Network error — don't auto-logout, just stop loading
    } finally {
      setLoading(false);
    }
  }, [authFetch, refreshAccessToken, updateToken]);

  // On mount: if there's a stored user, try to get a fresh access token via refresh flow
  useEffect(() => {
    const storedUser = localStorage.getItem('bys_user');
    if (storedUser) {
      refreshAccessToken().then(newToken => {
        if (!newToken) {
          // Refresh failed, but don't clear user yet - profile fetch might still work
          // Try profile fetch as fallback
          refreshProfile();
        } else {
          // Got a new token, refresh profile data
          refreshProfile();
        }
      });
    }
  // Only run on mount
  }, []);

  // Token refresh mechanism - refresh every 14 minutes (token expires at 15 min)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 14 * 60 * 1000); // 14 minutes
    return () => clearInterval(interval);
  }, [token, refreshAccessToken]);

  // Social login function — properly updates React state + localStorage
  const socialLogin = useCallback((authToken: string, userData: User) => {
    updateToken(authToken);
    setUser(userData);
    localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(userData)));
  }, [updateToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshProfile, socialLogin, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
