import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('erp_token');
    const savedUser = localStorage.getItem('erp_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user credentials:', err);
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('erp_token', res.token);
      localStorage.setItem('erp_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  const switchRole = (role: Role) => {
    const emailByRole: Record<Role, string> = {
      Admin: 'admin@minierp.com',
      Sales: 'sales@minierp.com',
      Warehouse: 'warehouse@minierp.com',
      Accounts: 'accounts@minierp.com',
    };
    const nameByRole: Record<Role, string> = {
      Admin: 'Alice Administrator',
      Sales: 'Sam Salesman',
      Warehouse: 'Wanda Warehouse',
      Accounts: 'Arthur Accountant',
    };

    const updatedUser: User = {
      id: user?.id || `usr-${role.toLowerCase()}`,
      name: nameByRole[role],
      email: emailByRole[role],
      role,
    };
    setUser(updatedUser);
    localStorage.setItem('erp_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
