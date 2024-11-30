// frontend/src/components/chat/ChatMessages.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chatTypes';

export const ChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit('getChatHistory');

    socket.on('chatHistory', (history: ChatMessage[]) => {
      setMessages(history);
      scrollToBottom();
    });

    socket.on('newMessage', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
    };
  }, [socket]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex flex-col ${
            message.userId === user?.id ? 'items-end' : 'items-start'
          }`}
        >
          <div className={`max-w-[70%] ${
            message.userId === user?.id ? 
            'bg-blue-500 text-white' : 
            'bg-gray-100 text-gray-800'
          } rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{message.userName}</span>
              <span className="text-xs opacity-75">• {message.userRole}</span>
            </div>
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-75 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};