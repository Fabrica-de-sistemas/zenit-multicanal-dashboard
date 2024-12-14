// frontend/contexts/StatusContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { statusConfig } from '@/config/statusConfig';
import { OnlineUser } from '@/types/chatTypes';

interface StatusContextData {
    currentStatus: keyof typeof statusConfig;
    setUserStatus: (status: keyof typeof statusConfig) => void;
    onlineUsers: OnlineUser[];
}

const StatusContext = createContext<StatusContextData>({} as StatusContextData);

export function StatusProvider({ children }: { children: React.ReactNode }) {
    const [currentStatus, setCurrentStatus] = useState<keyof typeof statusConfig>('available');
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const socket = useSocket();
    const { user } = useAuth();

    // Carregar e emitir status inicial
    useEffect(() => {
        if (!socket || !user?.id) return;

        const savedStatus = localStorage.getItem(`userStatus_${user.id}`);
        const initialStatus = savedStatus && Object.keys(statusConfig).includes(savedStatus) 
            ? savedStatus as keyof typeof statusConfig 
            : 'available';

        setCurrentStatus(initialStatus);

        // Emite o status salvo assim que conectar
        socket.emit('updateStatus', {
            userId: user.id,
            status: initialStatus
        });

    }, [socket, user]);

    // Gerenciar lista de usuários online
    useEffect(() => {
        if (!socket) return;

        socket.on('onlineUsers', (users: OnlineUser[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('onlineUsers');
        };
    }, [socket]);

    const setUserStatus = (status: keyof typeof statusConfig) => {
        if (!user?.id || !socket) return;

        setCurrentStatus(status);
        localStorage.setItem(`userStatus_${user.id}`, status);

        socket.emit('updateStatus', {
            userId: user.id,
            status
        });
    };

    return (
        <StatusContext.Provider value={{ 
            currentStatus, 
            setUserStatus,
            onlineUsers
        }}>
            {children}
        </StatusContext.Provider>
    );
}

export const useStatus = () => useContext(StatusContext);