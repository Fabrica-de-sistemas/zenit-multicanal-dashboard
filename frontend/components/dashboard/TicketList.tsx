// components/dashboard/TicketList.tsx
import { Ticket } from '@/types/chat';
import { Instagram, Twitter, Facebook, MessageCircle, MessageSquare } from 'lucide-react';
import { formatPhoneNumber, formatElapsedTime } from '@/utils/formatters';
import { useEffect, useState } from 'react';

interface TicketListProps {
    tickets: Ticket[];
    selectedTicketId: string | null;
    onSelectTicket: (ticketId: string) => void;
}

export const TicketList: React.FC<TicketListProps> = ({
    tickets,
    selectedTicketId,
    onSelectTicket
}) => {
    // Estado para forçar atualizações
    const [, setUpdate] = useState(0);
    // Efeito para atualizar o componente a cada minuto
    useEffect(() => {
        const timer = setInterval(() => {
            setUpdate(prev => prev + 1);
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Função para calcular o tempo decorrido
    const getElapsedTime = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000); // Convertendo para minutos
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
        }
        if (hours > 0) {
            return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        if (minutes > 0) {
            return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
        }
        return 'agora mesmo';
    };

    const getChannelIcon = (platform: string) => {
        switch (platform) {
            case 'instagram':
                return <Instagram size={14} className="text-pink-500" />;
            case 'twitter':
                return <Twitter size={14} className="text-blue-400" />;
            case 'facebook':
                return <Facebook size={14} className="text-blue-600" />;
            case 'whatsapp':
                return <MessageCircle size={14} className="text-green-500" />;
            case 'site':
                return <MessageSquare size={14} className="text-purple-500" />;
            default:
                return null;
        }
    };

    // Função para obter o identificador principal do ticket
    const getTicketIdentifier = (ticket: Ticket): string => {
        if (!ticket.messages.length) return 'Sem mensagens';

        const firstMessage = ticket.messages[0];
        switch (firstMessage.platform) {
            case 'whatsapp':
                return formatPhoneNumber(firstMessage.sender.username);
            case 'instagram':
            case 'twitter':
                return `@${firstMessage.sender.username}`;
            case 'facebook':
                return firstMessage.sender.name;
            case 'site':
                return firstMessage.sender.name;
            default:
                return firstMessage.sender.username;
        }
    };

    return (
        <div className="w-80 border-r bg-white overflow-y-auto">
            {tickets.map((ticket) => {
                const lastMessage = ticket.messages[ticket.messages.length - 1];
                const identifier = getTicketIdentifier(ticket);

                return (
                    <div
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket.id)}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${selectedTicketId === ticket.id ? 'bg-blue-50' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{identifier}</span>
                                {lastMessage && getChannelIcon(lastMessage.platform)}
                            </div>
                            <span className="text-xs text-gray-500">
                                {lastMessage ? formatElapsedTime(lastMessage.timestamp) : ''}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2 break-words">
                            {lastMessage?.content || 'Sem mensagens'}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded ${ticket.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {ticket.status === 'resolved' ? 'Resolvido' : 'Em Atendimento'}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};