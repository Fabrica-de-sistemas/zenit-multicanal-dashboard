// frontend/src/components/chat/ChatInput.tsx
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

export const ChatInput = () => {
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket();
  const { user } = useAuth();

  const handleSendMessage = () => {
    if (!socket || !newMessage.trim() || !user) return;

    const messageData = {
      content: newMessage,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando mensagem:', messageData);
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};