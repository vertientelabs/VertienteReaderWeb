'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import { useTrackPageVisit } from '@/lib/hooks/use-recent-activity';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';
import Breadcrumb from '@/components/layout/breadcrumb';
import { FullPageLoader } from '@/components/shared/loading-skeleton';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const collapsed = useSidebar((s) => s.collapsed);

  useTrackPageVisit(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <FullPageLoader />;
  if (!user) return null;

  const desktopMargin = collapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]';

  return (
    <div className="min-h-screen mesh-bg">
      <Sidebar />
      <div className={`ml-0 ${desktopMargin} transition-all duration-300`}>
        <Topbar />
        <main className="p-3 sm:p-4 lg:p-6">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
