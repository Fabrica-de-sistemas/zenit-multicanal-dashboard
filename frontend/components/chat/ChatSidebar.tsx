// frontend/src/components/chat/ChatSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { OnlineUsersList } from './OnlineUsersList';
import { UserStatusSelector } from './UserStatusSelector';

export const ChatSidebar = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState('available');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('userConnected', {
      id: user.id,
      name: user.fullName,
      role: user.role,
      sector: user.sector || 'Geral',
      status: currentStatus,
      isOnline: true,
      lastSeen: new Date().toISOString()
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('onlineUsers');
    };
  }, [socket, user]);

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
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
            onStatusChange={setCurrentStatus}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <OnlineUsersList users={onlineUsers} />
      </div>
    </div>
  );
};