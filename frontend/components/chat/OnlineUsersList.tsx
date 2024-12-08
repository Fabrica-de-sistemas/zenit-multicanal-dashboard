// frontend/src/components/chat/OnlineUsersList.tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
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
  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-medium text-slate-400 px-2">
        Colaboradores Online ({users.length})
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200"
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
            {/* Só mostra o botão de chat se não for o próprio usuário */}
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
      </div>
    </div>
  );
};