// frontend/src/components/chat/ChatMessages.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/types/chatTypes';
import { Paperclip, Smile } from 'lucide-react';
import { MessageReactions } from './MessageReactions';

interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export const ChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit('getChatHistory');

    const handleChatHistory = async (history: ChatMessage[]) => {
      console.log('Histórico recebido:', history);
      setMessages(history);
      setTimeout(scrollToBottom, 100);
    };

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    };

    const handleMessageReacted = (updatedMessage: ChatMessage) => {
      setMessages(prev =>
        prev.map(msg => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    };

    socket.on('chatHistory', handleChatHistory);
    socket.on('newMessage', handleNewMessage);
    socket.on('messageReacted', handleMessageReacted);

    return () => {
      socket.off('chatHistory');
      socket.off('newMessage');
      socket.off('messageReacted');
    };
  }, [socket]);

  const handleReaction = (messageId: string, emoji: string) => {
    if (!socket || !user) return;

    socket.emit('addReaction', {
      messageId,
      emoji,
      userId: user.id,
      userName: user.fullName,
    });
  };

  // Função para verificar se o arquivo é PDF
  const isPdfFile = (fileType?: string) => {
    return fileType?.startsWith('application/pdf');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${message.userId === user?.id ? 'items-end' : 'items-start'
            }`}
        >
          <div
            className={`max-w-[70%] ${message.userId === user?.id
              ? 'bg-emerald-100 text-gray-800'  // Mudando de blue-500 para emerald-600
              : 'bg-gray-100 text-gray-800'
              } rounded-lg p-3`}
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
                ) : isPdfFile(message.fileType) ? (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 ${message.userId === user?.id ? 'text-white hover:text-gray-100' : 'text-blue-500 hover:text-blue-600'
                      }`}
                  >
                    <Paperclip size={16} />
                    <span className="underline">{message.fileName}</span>
                  </a>
                ) : (
                  <a
                    href={message.fileUrl}
                    download={message.fileName}
                    className={`flex items-center gap-2 ${message.userId === user?.id ? 'text-emerald-700 hover:text-emerald-800'
                      : 'text-blue-500 hover:text-blue-600'
                      }`}
                  >
                    <Paperclip size={16} />
                    <span className="underline">{message.fileName}</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
            <span className="text-xs opacity-75 mt-1 block">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>

            <MessageReactions
              reactions={message.reactions || []}
              onReact={(emoji) => handleReaction(message.id, emoji)}
              showEmojiPicker={activeEmojiPicker === message.id}
              onToggleEmojiPicker={() =>
                setActiveEmojiPicker(activeEmojiPicker === message.id ? null : message.id)
              }
              currentUserId={user?.id || ''}
            />
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
