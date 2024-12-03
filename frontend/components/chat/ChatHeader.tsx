// frontend/src/components/chat/ChatHeader.tsx
import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export const ChatHeader = () => {
  const [onlineUsers, setOnlineUsers] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleOnlineUsers = (users: any[]) => {
      setOnlineUsers(users.length);
    };

    socket.on('onlineUsers', handleOnlineUsers);

    socket.emit('getOnlineUsers');

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, [socket]);

  return (
    <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <User className="w-5 h-5 text-indigo-500" />
        </div>
        <h2 className="font-semibold text-slate-800">Chat Interno</h2>
      </div>
    </div>
  );
};