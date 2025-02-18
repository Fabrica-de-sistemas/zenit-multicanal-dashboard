// frontend/hooks/useUserPermissions.ts
import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { Permission } from '@/config/permissions';

export function useUserPermissions(userId: string) {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const socket = useSocket();

    useEffect(() => {
        if (!socket || !userId) return;

        // Solicita permissões ao conectar
        socket.emit('requestUserPermissions', userId);

        // Listener para atualizações
        socket.on('userPermissionsUpdated', (data: { userId: string; permissions: Permission[] }) => {
            if (data.userId === userId) {
                setPermissions(data.permissions);
            }
        });

        return () => {
            socket.off('userPermissionsUpdated');
        };
    }, [socket, userId]);

    const updatePermissions = async (newPermissions: Permission[]) => {
        if (!socket) return;
        socket.emit('updateUserPermissions', { userId, permissions: newPermissions });
    };

    return {
        permissions,
        updatePermissions
    };
}