// frontend/hooks/useAnalytics.ts
import { useState, useEffect } from 'react';
import { analyticsApi } from '@/services/api';
import { AnalyticsData } from '@/types/analytics';

export function useAnalytics(range: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getAnalytics(range);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar dados'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const exportData = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await analyticsApi.exportAnalytics(format, range);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${format}`;
      a.click();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  };

  return { data, loading, error, exportData };
}