import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

// Sensitive fields that should never be stored in localStorage (Old #46 fix)
const SENSITIVE_FIELDS = ['passwordHash', 'resetToken', 'resetTokenExpiry', 'password', 'token', 'walletBalance', 'bankAccountNumber', 'ifscCode', 'upiId'] as const;

function sanitizeUser(user: User | null): User | null {
  if (!user) return null;
  const sanitized = { ...user };
  for (const field of SENSITIVE_FIELDS) {
    delete (sanitized as Record<string, unknown>)[field];
  }
  return sanitized;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('bys_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('bys_token');
    // Guard against the literal string "undefined" or "null" being stored (Old #42 fix)
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    return stored;
  });
  const [loading, setLoading] = useState(() => {
    // If there's a stored token, we need to verify it on mount
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('bys_token');
    return !!stored && stored !== 'undefined';
  });

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const authToken = data.accessToken || data.token;
      if (authToken) {
        setToken(authToken);
        setUser(data.user);
        localStorage.setItem('bys_token', authToken);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
      } else {
        throw new Error('No token received');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      // Map roleId to role string for the API, supporting all new roles
      // Include specialization if provided (N45 fix)
      const payload = {
        ...data,
        roleId: data.roleId || 1,
        role: data.role || ROLE_MAP[data.roleId] || 'CLIENT',
      };
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Registration failed');
      const authToken = result.accessToken || result.token;
      if (authToken) {
        setToken(authToken);
        setUser(result.user);
        localStorage.setItem('bys_token', authToken);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(result.user)));
      } else {
        throw new Error('No token received');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget call to invalidate the JWT on the server
    if (token) {
      fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => { /* ignore */ });
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('bys_token');
    localStorage.removeItem('bys_user');
  }, [token]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    const res = await fetch(apiUrl('/api/auth/profile'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    setUser(data.user);
    localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/profile'), {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(data.user)));
      } else {
        // Auto-logout on 401/invalid token (N4, N7 fix)
        setToken(null);
        setUser(null);
        localStorage.removeItem('bys_token');
        localStorage.removeItem('bys_user');
      }
    } catch {
      // Network error — don't auto-logout, just stop loading
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Bug #26: Refresh profile on mount if there's a stored token
  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bug #27: Token refresh mechanism - refresh every 14 minutes (token expires at 15 min)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      refreshProfile();
    }, 14 * 60 * 1000); // 14 minutes
    return () => clearInterval(interval);
  }, [token, refreshProfile]);

  // Social login function — properly updates React state + localStorage (N23 fix)
  const socialLogin = useCallback((authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('bys_token', authToken);
    localStorage.setItem('bys_user', JSON.stringify(sanitizeUser(userData)));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshProfile, socialLogin }}>
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
