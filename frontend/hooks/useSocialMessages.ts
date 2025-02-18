// frontend/hooks/useSocialMessages.ts
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SocialMessage } from '@/types/auth';

export function useSocialMessages() {
  const [messages, setMessages] = useState<SocialMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io('http://localhost:8080');

    socket.on('connect', () => {
      console.log('Conectado ao servidor de mensagens');
      setLoading(false);
    });

    socket.on('newMessage', (message: SocialMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('connect_error', (err) => {
      setError('Erro de conexão com o servidor');
      console.error('Erro de conexão:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { messages, loading, error };
}