// database/queries/chatQueries.ts
export const chatQueries = {
  // Chat interno
  saveCompanyMessage: `
        INSERT INTO company_messages (id, user_id, user_role, content)
        VALUES (?, ?, ?, ?)
    `,

  getCompanyMessages: `
        SELECT cm.*, u.full_name, u.role, u.sector
        FROM company_messages cm
        JOIN users u ON cm.user_id = u.id
        ORDER BY cm.created_at
    `,

  saveMessageReaction: `
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (?, ?, ?)
    `,

  // Chat privado
  savePrivateMessage: `
      INSERT INTO private_messages (id, from_user_id, to_user_id, content)
      VALUES (?, ?, ?, ?)
    `,

  getPrivateMessages: `
      SELECT pm.*, 
             u1.full_name as from_name,
             u2.full_name as to_name
      FROM private_messages pm
      JOIN users u1 ON pm.from_user_id = u1.id
      JOIN users u2 ON pm.to_user_id = u2.id
      WHERE (from_user_id = ? AND to_user_id = ?)
         OR (from_user_id = ? AND to_user_id = ?)
      ORDER BY pm.created_at
    `,

  // Tickets
  createTicket: `
      INSERT INTO tickets (id, status)
      VALUES (?, ?)
    `,

  saveTicketMessage: `
      INSERT INTO ticket_messages 
      (id, ticket_id, content, sender_name, sender_username, is_operator)
      VALUES (?, ?, ?, ?, ?, ?)
    `,

  getTicketMessages: `
      SELECT *
      FROM ticket_messages
      WHERE ticket_id = ?
      ORDER BY created_at
    `,

  updateTicketStatus: `
      UPDATE tickets
      SET status = ?
      WHERE id = ?
    `,

  getAllTickets: `
      SELECT t.*, 
             COUNT(tm.id) as message_count,
             MAX(tm.created_at) as last_message_at
      FROM tickets t
      LEFT JOIN ticket_messages tm ON t.id = tm.ticket_id
      GROUP BY t.id
      ORDER BY t.updated_at DESC
    `,
  saveReaction: `
        INSERT INTO message_reactions (message_id, user_id, emoji)
        VALUES (?, ?, ?)
    `,

  deleteReaction: `
        DELETE FROM message_reactions 
        WHERE message_id = ? AND user_id = ? AND emoji = ?
    `,

  getMessageReactions: `
        SELECT * FROM message_reactions 
        WHERE message_id = ?
    `
};