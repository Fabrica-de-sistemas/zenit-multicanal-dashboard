// backend/src/controllers/dashboardController.ts
import { Request, Response } from 'express';
import { query } from '../lib/db';

export const dashboardController = {
  async getMetrics(req: Request, res: Response) {
    try {
      // Total de tickets
      const [totalTickets] = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
        FROM tickets
      `);

      // Tempo médio de resposta (em minutos)
      const [responseTime] = await query(`
        SELECT AVG(
          TIMESTAMPDIFF(MINUTE, 
            t.created_at, 
            (SELECT MIN(created_at) 
             FROM ticket_messages 
             WHERE ticket_id = t.id AND is_operator = 1)
          )
        ) as avg_response_time
        FROM tickets t
      `);

      // Tickets por status nas últimas 24h
      const ticketsLast24h = await query(`
        SELECT 
          DATE_FORMAT(created_at, '%H:00') as hour,
          COUNT(*) as count
        FROM tickets
        WHERE created_at >= NOW() - INTERVAL 24 HOUR
        GROUP BY DATE_FORMAT(created_at, '%H:00')
        ORDER BY hour
      `);

      // Resolução por operador
      const operatorPerformance = await query(`
        SELECT 
          tm.sender_name as operator,
          COUNT(DISTINCT t.id) as tickets_handled,
          AVG(CASE WHEN t.status = 'resolved' THEN 1 ELSE 0 END) as resolution_rate
        FROM ticket_messages tm
        JOIN tickets t ON tm.ticket_id = t.id
        WHERE tm.is_operator = 1
        GROUP BY tm.sender_name
      `);

      return res.json({
        overview: {
          total: totalTickets.total,
          active: totalTickets.active,
          resolved: totalTickets.resolved,
          avgResponseTime: Math.round(responseTime.avg_response_time || 0)
        },
        ticketsLast24h,
        operatorPerformance
      });
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      return res.status(500).json({ error: 'Erro ao buscar métricas' });
    }
  }
};