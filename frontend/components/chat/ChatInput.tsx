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
    <div className="p-4 border-t border-slate-100 bg-white/90 backdrop-blur-sm">
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
          className="p-2.5 text-slate-400 hover:text-indigo-500 rounded-xl hover:bg-indigo-50 transition-all duration-200"
          title="Anexar arquivo"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all duration-200 flex items-center"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};