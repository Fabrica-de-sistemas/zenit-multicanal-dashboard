// frontend/types/analytics.ts
export interface AnalyticsData {
    overview: {
      averageResponseTime: number;
      totalTickets: number;
      resolvedTickets: number;
      resolutionRate: number;
      activeAgents: number;
      averageResolutionTime: number;
    };
    timeData: {
      hour: string;
      tickets: number;
    }[];
    performanceData: {
      name: string;
      ticketsHandled: number;
      averageResponseTime: number;
      resolutionRate: number;
    }[];
    channelsData: {
      name: string;
      total: number;
    }[];
    peakHours: {
      hour: string;
      count: number;
    }[];
  }