// frontend/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

let globalSocket: Socket | null = null; // Variável global para manter uma única conexão

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Se já existe uma conexão global, usa ela
        if (globalSocket) {
            socketRef.current = globalSocket;
            return;
        }

        const token = localStorage.getItem('token');

        const newSocket = io('http://localhost:5000', {
            reconnectionDelayMax: 10000,
            reconnection: true,
            reconnectionAttempts: 10,
            transports: ['websocket', 'polling'],
            auth: {
                token
            },
            withCredentials: true,
            timeout: 10000
        });

        newSocket.on('connect', () => {
            console.log('Socket conectado com sucesso ao servidor');
        });

        newSocket.on('connect_error', (error) => {
            if (error.message !== 'websocket error') {
                console.error('Erro de conexão Socket.IO:', error.message);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
        });

        // Armazena o socket globalmente
        globalSocket = newSocket;
        socketRef.current = newSocket;

        // Cleanup apenas quando a aplicação for fechada
        return () => {
            // Não fechamos a conexão aqui mais
        };
    }, []);

    return socketRef.current;
}