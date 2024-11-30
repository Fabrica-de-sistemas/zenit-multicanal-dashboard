// frontend/src/components/chat/ChatSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { OnlineUsersList } from './OnlineUsersList';
import { UserStatusSelector } from './UserStatusSelector';
import { statusConfig } from '@/config/statusConfig';

export const ChatSidebar: React.FC = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<keyof typeof statusConfig>('available');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    // Emite evento de conexão do usuário
    socket.emit('userConnected', {
      id: user.id,
      name: user.fullName,
      role: user.role,
      sector: user.sector || 'Geral',
      status: currentStatus,
    });

    // Escuta atualizações da lista de usuários
    socket.on('onlineUsers', (users) => {
      console.log('Usuários online atualizados:', users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off('onlineUsers');
    };
  }, [socket, user]);

  const handleStatusChange = (newStatus: keyof typeof statusConfig) => {
    if (!socket || !user) return;
    setCurrentStatus(newStatus);
    socket.emit('updateStatus', {
      userId: user.id,
      status: newStatus
    });
  };

  if (!user) return null;

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Seção do usuário atual */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            {user.fullName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.sector || 'Geral'}
            </p>
          </div>
        </div>
        <UserStatusSelector 
          currentStatus={currentStatus}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Lista de colaboradores online */}
      <div className="flex-1 overflow-y-auto">
        <OnlineUsersList users={onlineUsers} />
      </div>
    </div>
  );
};