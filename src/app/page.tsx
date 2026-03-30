'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { FullPageLoader } from '@/components/shared/loading-skeleton';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/clientes');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return <FullPageLoader />;
}
