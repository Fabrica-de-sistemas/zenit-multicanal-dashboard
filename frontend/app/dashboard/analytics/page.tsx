// frontend/app/dashboard/analytics/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { AnalyticsDashboard } from '@/components/dashboard/Analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (!hasPermission('view_marketing_analytics')) {
      router.push('/dashboard');
    }
  }, [hasPermission, router]);

  if (!hasPermission('view_marketing_analytics')) {
    return null;
  }

  return <AnalyticsDashboard />;
}