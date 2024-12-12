// hooks/useAuth.ts
'use client'
import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface User {
  sector: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const socket = useSocket();

  // Primeiro useEffect apenas para carregar dados do usuário
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []); // Só executa uma vez ao montar

  // Segundo useEffect para gerenciar conexão do socket
  useEffect(() => {
    if (!socket || !user) return;

    // Função de conexão
    const connectUser = () => {
      socket.emit('userConnected', {
        id: user.id,
        name: user.fullName,
        role: user.role,
        sector: user.sector || 'Geral',
        status: 'available'
      });
    };

    // Conecta ao iniciar
    connectUser();

    // Reconecta apenas se o socket cair
    socket.on('connect', connectUser);

    return () => {
      socket.off('connect', connectUser);
    };
  }, [socket, user]); // Depende do socket e user

  const logout = () => {
    if (socket && user) {
      socket.emit('userDisconnected', {
        userId: user.id
      });
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  return { user, logout };
}