// services/analyticsService.ts
import { useAuthFetch } from '@/hooks/useAuthFetch';

export const analyticsService = {
  async getAnalytics(range: string) {
    const { authFetch } = useAuthFetch();
    const response = await authFetch(`http://localhost:8080/api/analytics?range=${range}`);
    return response.json();
  },

  async exportAnalytics(format: 'pdf' | 'excel', range: string) {
    const { authFetch } = useAuthFetch();
    const response = await authFetch(
      `http://localhost:8080/api/analytics/export?format=${format}&range=${range}`
    );
    return response.blob();
  }
};