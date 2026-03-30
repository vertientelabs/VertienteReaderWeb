'use client';

import { createContext, useContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Usuario, UserRole } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRole(): UserRole | null {
  const { user } = useAuth();
  return user?.usertype ?? null;
}

export function useHasRole(...roles: UserRole[]): boolean {
  const role = useRole();
  if (!role) return false;
  return roles.includes(role);
}
