// frontend/src/components/chat/ChatMessages.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chatTypes';
import { Paperclip } from 'lucide-react';

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

  // Função para verificar se o arquivo é PDF
  const isPdfFile = (fileType?: string) => {
    return fileType?.startsWith('application/pdf');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${message.userId === user?.id ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[70%] ${message.userId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-3`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{message.userName}</span>
              <span className="text-xs opacity-75">• {message.userRole}</span>
            </div>
            {message.fileUrl ? (
              <div className="flex flex-col">
                {message.fileType?.startsWith('image/') ? (
                  <>
                    <img
                      src={message.fileUrl}
                      alt={message.fileName}
                      className="max-w-full rounded-lg mb-2"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      <Paperclip size={12} />
                      <span>{message.fileName}</span>
                    </div>
                  </>
                ) : (
                  // Se for PDF, abre em uma nova aba
                  isPdfFile(message.fileType) ? (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 ${message.userId === user?.id ? 'text-white hover:text-gray-100' : 'text-blue-500 hover:text-blue-600'}`}
                    >
                      <Paperclip size={16} />
                      <span className="underline">{message.fileName}</span>
                    </a>
                  ) : (
                    // Para outros tipos de arquivo, força o download
                    <a
                      href={message.fileUrl}
                      download={message.fileName} // Isso força o download
                      className={`flex items-center gap-2 ${message.userId === user?.id ? 'text-white hover:text-gray-100' : 'text-blue-500 hover:text-blue-600'}`}
                    >
                      <Paperclip size={16} />
                      <span className="underline">{message.fileName}</span>
                    </a>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
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
