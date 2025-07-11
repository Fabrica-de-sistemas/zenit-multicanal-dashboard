// frontend/components/dashboard/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Header } from '@/components/dashboard/Header';
import { TicketList } from '@/components/dashboard/TicketList';
import { ChatArea } from '@/components/dashboard/ChatArea';
import { CustomerInfo } from '@/components/dashboard/CustomerInfo';
import { Ticket } from '@/types/chat';

export function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    console.log('Configurando listeners do socket');

    socket.on('tickets', (initialTickets: Ticket[]) => {
      console.log('Tickets recebidos:', initialTickets);
      setTickets(initialTickets);
    });

    socket.on('ticketUpdated', (updatedTicket: Ticket) => {
      console.log('Ticket atualizado recebido:', updatedTicket);
      setTickets(prevTickets => {
        const exists = prevTickets.some(t => t.id === updatedTicket.id);
        if (exists) {
          return prevTickets.map(ticket =>
            ticket.id === updatedTicket.id ? updatedTicket : ticket
          );
        } else {
          return [...prevTickets, updatedTicket];
        }
      });
    });

    return () => {
      socket.off('tickets');
      socket.off('ticketUpdated');
    };
  }, [socket]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  const handleSendMessage = (message: string) => {
    if (!socket || !selectedTicketId) return;
    socket.emit('sendMessage', {
      ticketId: selectedTicketId,
      message
    });
  };

  const handleResolveTicket = () => {
    if (!socket || !selectedTicketId) return;
    socket.emit('resolveTicket', selectedTicketId);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <TicketList
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
        />
        
        <ChatArea
          selectedMessage={selectedTicket}
          onSendMessage={handleSendMessage}
          onResolveTicket={handleResolveTicket}
        />
        
        <CustomerInfo
          selectedMessage={selectedTicket}
        />
      </div>
    </div>
  );
}