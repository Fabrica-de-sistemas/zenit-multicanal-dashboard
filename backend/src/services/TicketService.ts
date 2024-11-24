// backend/src/services/TicketService.ts
interface Ticket {
    id: string;
    status: 'open' | 'resolved';
    messages: any[];
    createdAt: string;
    updatedAt: string;
  }
  
  class TicketService {
    private tickets: Map<string, Ticket> = new Map();
  
    addMessage(ticketId: string, message: any) {
      let ticket = this.tickets.get(ticketId);
  
      if (!ticket) {
        // Cria novo ticket se não existir
        ticket = {
          id: ticketId,
          status: 'open',
          messages: [],
          createdAt: new Date().toLocaleString('pt-BR'),
          updatedAt: new Date().toLocaleString('pt-BR')
        };
      }
  
      if (ticket.status === 'resolved') {
        // Se o ticket estiver resolvido, cria um novo
        ticket = {
          id: ticketId,
          status: 'open',
          messages: [],
          createdAt: new Date().toLocaleString('pt-BR'),
          updatedAt: new Date().toLocaleString('pt-BR')
        };
      }
  
      ticket.messages.push(message);
      ticket.updatedAt = new Date().toLocaleString('pt-BR');
      this.tickets.set(ticketId, ticket);
  
      return ticket;
    }
  
    resolveTicket(ticketId: string) {
      const ticket = this.tickets.get(ticketId);
      if (ticket) {
        ticket.status = 'resolved';
        ticket.updatedAt = new Date().toLocaleString('pt-BR');
        this.tickets.set(ticketId, ticket);
      }
      return ticket;
    }
  
    getTicket(ticketId: string) {
      return this.tickets.get(ticketId);
    }
  
    getAllTickets() {
      return Array.from(this.tickets.values());
    }
  }
  
  export const ticketService = new TicketService();