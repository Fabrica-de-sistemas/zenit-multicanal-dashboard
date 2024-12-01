// frontend/src/components/chat/ChatInput.tsx
'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';

export const ChatInput = () => {
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      const messageData = {
        content: `Arquivo: ${file.name}`,
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        timestamp: new Date().toISOString(),
        fileUrl: data.fileUrl,
        fileName: file.name,
        fileType: file.type
      };

      socket.emit('sendMessage', messageData);
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      alert('Erro ao enviar arquivo. Tente novamente.');
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
          title="Anexar arquivo"
        >
          <Paperclip size={18} />
        </button>
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