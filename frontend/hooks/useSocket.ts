// frontend/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            reconnectionDelayMax: 10000,
            reconnection: true,
            reconnectionAttempts: 10,
            transports: ['websocket', 'polling'], // Tente primeiro WebSocket, depois polling
            withCredentials: true,
            timeout: 10000
        });

        newSocket.on('connect', () => {
            console.log('Socket conectado com sucesso ao servidor');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Erro de conexão Socket.IO:', error.message);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket desconectado:', reason);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.close();
            }
        };
    }, []);

    return socket;
}