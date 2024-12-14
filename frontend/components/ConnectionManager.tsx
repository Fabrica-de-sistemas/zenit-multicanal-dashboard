// frontend/components/ConnectionManager.tsx
'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useStatus } from '@/contexts/StatusContext';

export function ConnectionManager() {
    const socket = useSocket();
    const { user } = useAuth();
    const { currentStatus } = useStatus();

    useEffect(() => {
        if (!socket || !user) return;

        // Função que emite a conexão
        const connectUser = () => {
            socket.emit('userConnected', {
                id: user.id,
                name: user.fullName,
                role: user.role,
                sector: user.sector || 'Geral',
                status: currentStatus
            });
        };

        // Conecta inicialmente
        connectUser();

        // Reconecta apenas se o socket realmente cair
        socket.on('connect', connectUser);

        return () => {
            socket.off('connect', connectUser);
        };
    }, [socket, user, currentStatus]);

    return null;
}