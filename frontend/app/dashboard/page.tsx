// frontend/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Header } from '@/components/dashboard/Header';
import { TicketList } from '@/components/dashboard/TicketList';
import { ChatArea } from '@/components/dashboard/ChatArea';
import { CustomerInfo } from '@/components/dashboard/CustomerInfo';
import { Ticket } from '@/types/chat';
import { ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    console.log('Configurando listeners do socket');

    // Recebe lista inicial de tickets
    socket.on('tickets', (initialTickets: Ticket[]) => {
      console.log('Tickets recebidos:', initialTickets);
      setTickets(initialTickets);
    });

    // Recebe atualizações de tickets
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

    // Cleanup
    return () => {
      socket.off('tickets');
      socket.off('ticketUpdated');
    };
  }, [socket]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Função para lidar com a seleção de ticket, limpando o ticket selecionado se o mesmo ID for clicado novamente
  const handleSelectTicket = (ticketId: string) => {
    if (selectedTicketId === ticketId) {
      setSelectedTicketId(null);
    } else {
      setSelectedTicketId(ticketId);
    }
  };

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
    // Removido o <Sidebar />, pois ele vem do layout principal
    <div className="flex-1 flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Tickets - Visível em telas grandes, ou em telas pequenas se nenhum ticket estiver selecionado */}
        <div className={`
          ${selectedTicketId ? 'hidden md:flex' : 'flex'}
          flex-col w-full md:w-80 lg:w-96 border-r bg-white overflow-y-auto
        `}>
          <TicketList
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={handleSelectTicket}
          />
        </div>
        
        {/* Área de Chat e Informações do Cliente */}
        {selectedTicket ? (
          <div className="flex-1 flex flex-col">
            {/* Botão para voltar em telas pequenas */}
            <button 
              onClick={() => setSelectedTicketId(null)} 
              className="md:hidden p-4 bg-gray-100 border-b flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={16} />
              Voltar para a lista
            </button>
            <div className="flex flex-1 overflow-hidden">
              <ChatArea
                selectedMessage={selectedTicket}
                onSendMessage={handleSendMessage}
                onResolveTicket={handleResolveTicket}
              />
              {/* Informações do Cliente - Oculto em telas médias e pequenas */}
              <div className="hidden lg:block">
                <CustomerInfo selectedMessage={selectedTicket} />
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-500 bg-gray-50">
            Selecione uma conversa para começar
          </div>
        )}
      </div>
    </div>
  );
}