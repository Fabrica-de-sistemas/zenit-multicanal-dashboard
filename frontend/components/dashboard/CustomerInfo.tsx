import React from 'react';
import { Instagram, Twitter, Facebook, MessageSquare, MessageCircle } from 'lucide-react';
import { Ticket } from '@/types/chat';
import { formatPhoneNumber, formatFullDateTime } from '@/utils/formatters';


interface CustomerInfoProps {
  selectedMessage: Ticket | null;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({ selectedMessage }) => {
  const getChannelIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram size={18} className="text-pink-500" />;
      case 'twitter':
        return <Twitter size={18} className="text-blue-400" />;
      case 'facebook':
        return <Facebook size={18} className="text-blue-600" />;
      case 'whatsapp':
        return <MessageCircle size={18} className="text-green-500" />;
      case 'site':
        return <MessageSquare size={18} className="text-purple-500" />;
      default:
        return null;
    }
  };

  // Se não houver mensagem selecionada ou não houver mensagens no ticket
  if (!selectedMessage || selectedMessage.messages.length === 0) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-6">Informações do Cliente</h3>
        <div className="text-gray-500 text-sm">
          Selecione uma conversa para ver os detalhes do cliente
        </div>
      </div>
    );
  }

  // Pega a primeira mensagem do ticket para informações do cliente
  const firstMessage = selectedMessage.messages[0];

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-6">
      <h3 className="font-semibold text-gray-800 mb-6">Informações do Cliente</h3>
      {selectedMessage ? (
        <div className="space-y-6">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome Completo</label>
            <p className="text-sm text-gray-800 font-medium">{firstMessage.sender.name}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Username</label>
            <p className="text-sm text-gray-800">{firstMessage.sender.username}</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Plataforma</label>
            <div className="flex items-center space-x-2 mt-1">
              {getChannelIcon(firstMessage.platform)}
              <span className="text-sm text-gray-800 capitalize">{firstMessage.platform}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Histórico</label>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-800 font-medium">Total de mensagens</span>
                <span className="text-sm text-gray-600">
                  {selectedMessage.messages.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-800 font-medium">Status</span>
                <span className={`text-xs px-2 py-1 rounded ${selectedMessage.status === 'resolved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
                  }`}>
                  {selectedMessage.status === 'resolved' ? 'Resolvido' : 'Em Atendimento'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Data de Criação</label>
            <p className="text-sm text-gray-800">
              {formatFullDateTime(selectedMessage.createdAt)}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Última Atualização</label>
            <p className="text-sm text-gray-800">
              {formatFullDateTime(selectedMessage.updatedAt)}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm">
          Selecione uma conversa para ver os detalhes do cliente
        </div>
      )}
    </div>
  );
};