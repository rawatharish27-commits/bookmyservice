import React, { createContext, useContext, useState, useCallback } from 'react';

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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  name: string;
  roleId: number;
  role?: string;
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
    return localStorage.getItem('bys_token');
  });
  const [loading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    const authToken = data.accessToken || data.token;
    setToken(authToken);
    setUser(data.user);
    localStorage.setItem('bys_token', authToken);
    localStorage.setItem('bys_user', JSON.stringify(data.user));
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // Map roleId to role string for the API, but also pass roleId for compatibility
    const roleMap: Record<number, string> = { 1: 'CLIENT', 2: 'PROVIDER' };
    const payload = {
      ...data,
      role: data.role || roleMap[data.roleId] || 'CLIENT',
    };
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    const authToken = result.accessToken || result.token;
    setToken(authToken);
    setUser(result.user);
    localStorage.setItem('bys_token', authToken);
    localStorage.setItem('bys_user', JSON.stringify(result.user));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bys_token');
    localStorage.removeItem('bys_user');
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    const res = await fetch('/api/auth/profile', {
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
    localStorage.setItem('bys_user', JSON.stringify(data.user));
  }, [token]);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('bys_user', JSON.stringify(data.user));
      }
    } catch {
      // ignore
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshProfile }}>
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
