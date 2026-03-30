'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { FullPageLoader } from '@/components/shared/loading-skeleton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/clientes');
    }
  }, [user, loading, router]);

  if (loading) return <FullPageLoader />;
  if (user) return null;

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {children}
    </div>
  );
}
