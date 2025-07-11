// frontend/components/dashboard/Analytics/AnalyticsDashboard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Clock,
  Users,
  MessageSquare,
  ThumbsUp,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  averageResponseTime: number;
  totalTickets: number;
  satisfactionRate: number;
  activeAgents: number;
  timeData: {
    hour: string;
    tickets: number;
  }[];
  performanceData: {
    agent: string;
    tickets: number;
    satisfaction: number;
  }[];
}

export const AnalyticsDashboard = () => {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState('today'); // 'today', 'week', 'month'

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${dateRange}`);
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [dateRange]);

  const exportData = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&range=${dateRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report.${format}`;
      a.click();
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard de Análise</h1>
        <div className="flex gap-4">
          <Button onClick={() => exportData('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => exportData('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros de Data */}
      <div className="flex gap-4">
        <Button
          variant={dateRange === 'today' ? 'default' : 'outline'}
          onClick={() => setDateRange('today')}
        >
          Hoje
        </Button>
        <Button
          variant={dateRange === 'week' ? 'default' : 'outline'}
          onClick={() => setDateRange('week')}
        >
          Última Semana
        </Button>
        <Button
          variant={dateRange === 'month' ? 'default' : 'outline'}
          onClick={() => setDateRange('month')}
        >
          Último Mês
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Tempo Médio de Resposta</p>
              <h3 className="text-2xl font-bold text-white">{data?.averageResponseTime}min</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-sm text-gray-400">Total de Atendimentos</p>
              <h3 className="text-2xl font-bold text-white">{data?.totalTickets}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-4">
            <ThumbsUp className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Satisfação</p>
              <h3 className="text-2xl font-bold text-white">{data?.satisfactionRate}%</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-sm text-gray-400">Atendentes Ativos</p>
              <h3 className="text-2xl font-bold text-white">{data?.activeAgents}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Horários de Pico */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Horários de Pico</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Performance por Atendente */}
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Performance por Atendente</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="agent" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend />
                <Bar dataKey="tickets" fill="#3B82F6" />
                <Bar dataKey="satisfaction" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};