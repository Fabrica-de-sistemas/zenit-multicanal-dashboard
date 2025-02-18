// frontend\components\chat\OnlineUsersList.tsx
import React, { useState } from 'react';
import { MessageCircle, Search, ArrowUpDown } from 'lucide-react';
import { OnlineUser } from '@/types/chatTypes';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-emerald-500';
    case 'away':
      return 'bg-amber-500';
    case 'meeting':
      return 'bg-rose-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusRingColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'ring-emerald-500/20';
    case 'away':
      return 'ring-amber-500/20';
    case 'meeting':
      return 'ring-rose-500/20';
    default:
      return 'ring-gray-400/20';
  }
};

type SortOrder = 'asc' | 'desc';

interface OnlineUsersListProps {
  users: OnlineUser[];
  onStartPrivateChat: (userId: string, userName: string) => void;
  currentUserId: string;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  users,
  onStartPrivateChat,
  currentUserId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorSortOrder, setSectorSortOrder] = useState<SortOrder>('asc');

  // Filtra e ordena usuários
  const filteredAndSortedUsers = [...users]
    // Filtrar por termo de busca
    .filter(user => {
      if (!searchTerm) return true;
      return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sector.toLowerCase().includes(searchTerm.toLowerCase());
    })
    // Ordenar usuários
    .sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;

      // Ordenação por setor
      const sectorCompare = sectorSortOrder === 'asc'
        ? a.sector.localeCompare(b.sector)
        : b.sector.localeCompare(a.sector);

      // Se setores são iguais, ordena por nome
      if (sectorCompare === 0) {
        return a.name.localeCompare(b.name);
      }

      return sectorCompare;
    });

  return (
    <div className="p-4 space-y-4">
      {/* Controles de busca e ordenação */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-slate-400">
            Colaboradores Online ({filteredAndSortedUsers.length})
          </span>
          <button
            onClick={() => setSectorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-1 text-sm text-slate-500 hover:text-indigo-500"
          >
            <span>Setor {sectorSortOrder === 'asc' ? '(A-Z)' : '(Z-A)'}</span>
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="space-y-2">
        {filteredAndSortedUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 ${user.id === currentUserId ? 'bg-slate-50' : ''
              }`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium">
                {user.name.charAt(0)}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)} ring-2 ${getStatusRingColor(user.status)} shadow-sm`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.sector} • {user.role}
              </p>
            </div>
            {user.id !== currentUserId && (
              <button
                onClick={() => onStartPrivateChat(user.id, user.name)}
                className="p-2 text-slate-400 hover:text-indigo-500 rounded-full hover:bg-indigo-50 transition-all duration-200"
                aria-label={`Iniciar chat privado com ${user.name}`}
                title={`Iniciar chat privado com ${user.name}`}
              >
                <MessageCircle size={18} />
              </button>
            )}
          </div>
        ))}

        {/* Mensagem quando não encontrar resultados */}
        {filteredAndSortedUsers.length === 0 && searchTerm && (
          <div className="text-center py-8 text-gray-500">
            Nenhum colaborador encontrado para "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};