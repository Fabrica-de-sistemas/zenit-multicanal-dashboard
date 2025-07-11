// backend/src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import { query } from '../lib/db';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const analyticsController = {
  async getAnalytics(req: Request, res: Response) {
    try {
      const { range } = req.query;

      // Define o intervalo de datas baseado no parâmetro
      let dateFilter;
      switch (range) {
        case 'week':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          dateFilter = 'AND DATE(created_at) = CURDATE()';
      }

      // Busca tempo médio de resposta
      const [avgResponse] = await query(`
       SELECT 
         AVG(TIMESTAMPDIFF(MINUTE, t.created_at, first_response.created_at)) as avg_response_time
       FROM tickets t
       LEFT JOIN (
         SELECT 
           ticket_id,
           MIN(created_at) as created_at
         FROM ticket_messages
         WHERE is_operator = 1
         GROUP BY ticket_id
       ) first_response ON t.id = first_response.ticket_id
       WHERE 1=1 ${dateFilter}
     `);

      // Total de tickets
      const [totalTickets] = await query(`
       SELECT COUNT(*) as total
       FROM tickets
       WHERE 1=1 ${dateFilter}
     `);

      // Total de tickets resolvidos
      const [resolvedTickets] = await query(`
       SELECT COUNT(*) as total
       FROM tickets
       WHERE status = 'resolved' ${dateFilter}
     `);

      // Taxa de resolução
      const resolutionRate = totalTickets.total > 0
        ? (resolvedTickets.total / totalTickets.total) * 100
        : 0;

      // Atendentes ativos
      const [activeAgents] = await query(`
       SELECT COUNT(DISTINCT user_id) as active
       FROM ticket_messages
       WHERE is_operator = 1 ${dateFilter}
     `);

      // Dados por hora
      const timeData = await query(`
       SELECT 
         HOUR(created_at) as hour,
         COUNT(*) as tickets
       FROM tickets
       WHERE 1=1 ${dateFilter}
       GROUP BY HOUR(created_at)
       ORDER BY hour
     `);

      // Performance por atendente
      const performanceData = await query(`
       SELECT 
         u.full_name as agent,
         COUNT(DISTINCT tm.ticket_id) as tickets_handled,
         AVG(TIMESTAMPDIFF(MINUTE, t.created_at, tm.created_at)) as avg_response_time,
         COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets
       FROM ticket_messages tm
       JOIN users u ON tm.user_id = u.id
       JOIN tickets t ON tm.ticket_id = t.id
       WHERE tm.is_operator = 1 ${dateFilter}
       GROUP BY u.id, u.full_name
     `);

      // Canais mais utilizados
      const channelsData = await query(`
       SELECT 
         platform,
         COUNT(*) as total
       FROM tickets
       WHERE 1=1 ${dateFilter}
       GROUP BY platform
     `);

      // Tempo médio de resolução
      const [avgResolutionTime] = await query(`
       SELECT 
         AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avg_resolution_time
       FROM tickets
       WHERE status = 'resolved' ${dateFilter}
     `);

      // Horários de pico
      const peakHours = await query(`
       SELECT 
         HOUR(created_at) as hour,
         COUNT(*) as ticket_count
       FROM tickets
       WHERE 1=1 ${dateFilter}
       GROUP BY HOUR(created_at)
       ORDER BY ticket_count DESC
       LIMIT 3
     `);

      return res.json({
        overview: {
          averageResponseTime: Math.round(avgResponse.avg_response_time || 0),
          totalTickets: totalTickets.total,
          resolvedTickets: resolvedTickets.total,
          resolutionRate: Math.round(resolutionRate),
          activeAgents: activeAgents.active,
          averageResolutionTime: Math.round(avgResolutionTime.avg_resolution_time || 0)
        },
        timeData: timeData.map(item => ({
          hour: `${item.hour}:00`,
          tickets: item.tickets
        })),
        performanceData: performanceData.map(agent => ({
          name: agent.agent,
          ticketsHandled: agent.tickets_handled,
          averageResponseTime: Math.round(agent.avg_response_time || 0),
          resolutionRate: Math.round((agent.resolved_tickets / agent.tickets_handled) * 100)
        })),
        channelsData: channelsData.map(channel => ({
          name: channel.platform,
          total: channel.total
        })),
        peakHours: peakHours.map(hour => ({
          hour: `${hour.hour}:00`,
          count: hour.ticket_count
        }))
      });

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      return res.status(500).json({ error: 'Erro ao buscar dados analíticos' });
    }
  },

  async exportAnalytics(req: Request, res: Response) {
    try {
      const { format, range } = req.query;

      // Busca os dados usando as mesmas queries do getAnalytics
      // Define o intervalo de datas
      let dateFilter;
      switch (range) {
        case 'week':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          dateFilter = 'AND DATE(created_at) = CURDATE()';
      }

      // Busca todos os dados necessários
      const [avgResponse] = await query(`
       SELECT 
         AVG(TIMESTAMPDIFF(MINUTE, t.created_at, first_response.created_at)) as avg_response_time
       FROM tickets t
       LEFT JOIN (
         SELECT 
           ticket_id,
           MIN(created_at) as created_at
         FROM ticket_messages
         WHERE is_operator = 1
         GROUP BY ticket_id
       ) first_response ON t.id = first_response.ticket_id
       WHERE 1=1 ${dateFilter}
     `);

      const [totalTickets] = await query(`
       SELECT COUNT(*) as total
       FROM tickets
       WHERE 1=1 ${dateFilter}
     `);

      const [resolvedTickets] = await query(`
       SELECT COUNT(*) as total
       FROM tickets
       WHERE status = 'resolved' ${dateFilter}
     `);

      const [activeAgents] = await query(`
       SELECT COUNT(DISTINCT user_id) as active
       FROM ticket_messages
       WHERE is_operator = 1 ${dateFilter}
     `);

      const performanceData = await query(`
       SELECT 
         u.full_name as agent,
         COUNT(DISTINCT tm.ticket_id) as tickets_handled,
         AVG(TIMESTAMPDIFF(MINUTE, t.created_at, tm.created_at)) as avg_response_time,
         COUNT(CASE WHEN t.status = 'resolved' THEN 1 END) as resolved_tickets
       FROM ticket_messages tm
       JOIN users u ON tm.user_id = u.id
       JOIN tickets t ON tm.ticket_id = t.id
       WHERE tm.is_operator = 1 ${dateFilter}
       GROUP BY u.id, u.full_name
     `);

      if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();

        // Planilha de Visão Geral
        const overviewSheet = workbook.addWorksheet('Visão Geral');
        overviewSheet.columns = [
          { header: 'Métrica', key: 'metric', width: 30 },
          { header: 'Valor', key: 'value', width: 20 }
        ];

        overviewSheet.addRows([
          { metric: 'Tempo Médio de Resposta (min)', value: Math.round(avgResponse.avg_response_time || 0) },
          { metric: 'Total de Tickets', value: totalTickets.total },
          { metric: 'Tickets Resolvidos', value: resolvedTickets.total },
          { metric: 'Taxa de Resolução (%)', value: Math.round((resolvedTickets.total / totalTickets.total) * 100) },
          { metric: 'Atendentes Ativos', value: activeAgents.active }
        ]);

        // Planilha de Performance por Atendente
        const performanceSheet = workbook.addWorksheet('Performance por Atendente');
        performanceSheet.columns = [
          { header: 'Atendente', key: 'agent', width: 30 },
          { header: 'Tickets Atendidos', key: 'tickets', width: 20 },
          { header: 'Tempo Médio de Resposta (min)', key: 'responseTime', width: 30 },
          { header: 'Tickets Resolvidos', key: 'resolved', width: 20 },
          { header: 'Taxa de Resolução (%)', key: 'resolutionRate', width: 25 }
        ];

        performanceSheet.addRows(
          performanceData.map(agent => ({
            agent: agent.agent,
            tickets: agent.tickets_handled,
            responseTime: Math.round(agent.avg_response_time || 0),
            resolved: agent.resolved_tickets,
            resolutionRate: Math.round((agent.resolved_tickets / agent.tickets_handled) * 100)
          }))
        );

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=analytics-report.xlsx'
        );

        await workbook.xlsx.write(res);
        return res.end();
      }

      if (format === 'pdf') {
        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=analytics-report.pdf'
        );

        doc.pipe(res);

        // Título
        doc.fontSize(20).text('Relatório de Analytics', { align: 'center' });
        doc.moveDown();

        // Visão Geral
        doc.fontSize(16).text('Visão Geral', { underline: true });
        doc.moveDown();
        doc.fontSize(12);
        doc.text(`Tempo Médio de Resposta: ${Math.round(avgResponse.avg_response_time || 0)} minutos`);
        doc.text(`Total de Tickets: ${totalTickets.total}`);
        doc.text(`Tickets Resolvidos: ${resolvedTickets.total}`);
        doc.text(`Taxa de Resolução: ${Math.round((resolvedTickets.total / totalTickets.total) * 100)}%`);
        doc.text(`Atendentes Ativos: ${activeAgents.active}`);
        doc.moveDown();

        // Performance por Atendente
        doc.fontSize(16).text('Performance por Atendente', { underline: true });
        doc.moveDown();
        doc.fontSize(12);

        performanceData.forEach(agent => {
          doc.text(`Atendente: ${agent.agent}`);
          doc.text(`  • Tickets Atendidos: ${agent.tickets_handled}`);
          doc.text(`  • Tempo Médio de Resposta: ${Math.round(agent.avg_response_time || 0)} minutos`);
          doc.text(`  • Taxa de Resolução: ${Math.round((agent.resolved_tickets / agent.tickets_handled) * 100)}%`);
          doc.moveDown();
        });

        doc.end();
      }

    } catch (error) {
      console.error('Erro ao exportar analytics:', error);
      return res.status(500).json({ error: 'Erro ao exportar dados analíticos' });
    }
  }
} as const;