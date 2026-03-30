'use client';

import { useEffect, useState, useCallback, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthContext } from '@/lib/hooks/use-auth';
import {
  loginWithEmail,
  logout as logoutService,
  resetPassword as resetPasswordService,
  onAuthChange,
  getUserProfile,
} from '@/lib/services/auth-service';
import type { Usuario } from '@/lib/types';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid, fbUser.email || undefined);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginWithEmail(email, password);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordService(email);
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}
