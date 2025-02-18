// frontend/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Inicializa o token depois que o componente montar (cliente)
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        setToken(storedToken);

        // Atualiza o token sempre que mudar no localStorage
        const handleStorageChange = () => {
            const newToken = localStorage.getItem('token');
            setToken(newToken);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorageChange);
        }

        // Socket connection logic ...
        if (storedToken) {
            try {
                // Desconecta socket existente se houver
                if (socketRef.current) {
                    console.log('Desconectando socket existente...');
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }

                // Cria novo socket
                console.log('Criando nova conexão socket...');
                socketRef.current = io('http://localhost:8080', {
                    auth: {
                        token: storedToken
                    },
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    transports: ['polling', 'websocket']
                });

                socketRef.current.on('connect', () => {
                    console.log('Socket conectado com sucesso');
                });

                socketRef.current.on('connect_error', (error) => {
                    console.error('Erro de conexão Socket.IO:', error.message);
                    
                    if (error.message.includes('Authentication error')) {
                        if (typeof window !== 'undefined') {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                        setToken(null);
                    }
                });

                socketRef.current.on('disconnect', (reason) => {
                    console.log('Socket desconectado. Razão:', reason);
                });

                socketRef.current.on('error', (error) => {
                    console.error('Erro no socket:', error);
                });
            } catch (error) {
                console.error('Erro ao criar socket:', error);
            }
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorageChange);
            }
            if (socketRef.current) {
                console.log('Limpando socket na desmontagem do componente');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return socketRef.current;
}