"use client"

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useStatus } from '@/contexts/StatusContext';
import { Permission } from '@/config/permissions';
import { PermissionUpdateDialog } from '@/components/PermissionUpdateDialog';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    sector: string;
    permissions?: Permission[];
}

interface PermissionChanges {
    added: Permission[];
    removed: Permission[];
    newToken: string;
}

export function ConnectionManager() {
    const socket = useSocket();
    const { user } = useAuth() as { user: User };
    const { currentStatus } = useStatus();
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [permissionChanges, setPermissionChanges] = useState<PermissionChanges | null>(null);

    useEffect(() => {
        if (!socket || !user) return;

        const connectUser = () => {
            socket.emit('userConnected', {
                id: user.id,
                name: user.fullName,
                role: user.role,
                sector: user.sector || 'Geral',
                status: currentStatus
            });
        };

        connectUser();

        socket.on(`permissionsUpdated:${user.id}`, (data) => {
            // O backend já nos envia exatamente o que mudou
            setPermissionChanges({
                added: data.added,
                removed: data.removed,
                newToken: data.token
            });
            setShowUpdateDialog(true);
        });

        socket.on('connect', connectUser);

        return () => {
            socket.off('connect', connectUser);
            socket.off(`permissionsUpdated:${user.id}`);
        };
    }, [socket, user, currentStatus]);

    const handleApplyNow = () => {
        if (permissionChanges?.newToken) {
            localStorage.setItem('token', permissionChanges.newToken);
            window.location.href = '/home';
        }
    };

    const handleApplyLater = () => {
        if (permissionChanges?.newToken) {
            localStorage.setItem('pendingToken', permissionChanges.newToken);
        }
        setShowUpdateDialog(false);
    };

    const handleCloseDialog = () => {
        if (permissionChanges &&
            permissionChanges.added.length > 0 &&
            permissionChanges.removed.length === 0) {
            handleApplyNow();
        } else {
            handleApplyLater();
        }
    };

    if (!showUpdateDialog || !permissionChanges) return null;

    return (
        <PermissionUpdateDialog
            isOpen={showUpdateDialog}
            onClose={handleCloseDialog}
            onApplyNow={handleApplyNow}
            onApplyLater={handleApplyLater}
            addedPermissions={permissionChanges?.added || []}
            removedPermissions={permissionChanges?.removed || []}
        />
    );
}