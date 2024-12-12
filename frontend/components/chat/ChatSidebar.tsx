import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { OnlineUsersList } from './OnlineUsersList';
import { UserStatusSelector } from './UserStatusSelector';
import { OnlineUser } from '@/types/chatTypes';
import { statusConfig } from '@/config/statusConfig';
import { usePrivateChat } from '@/contexts/PrivateChatContext';

export const ChatSidebar = () => {
    const socket = useSocket();
    const { user } = useAuth();
    const [currentStatus, setCurrentStatus] = useState<keyof typeof statusConfig>('available');
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const { startPrivateChat } = usePrivateChat();

    // Efeito para carregar o status inicial
    useEffect(() => {
        if (user?.id) {
            const savedStatus = localStorage.getItem(`userStatus_${user.id}`);
            if (savedStatus && Object.keys(statusConfig).includes(savedStatus)) {
                setCurrentStatus(savedStatus as keyof typeof statusConfig);
            }
        }
    }, [user]);

    // Efeito para gerenciar conexões e atualizações de status
    useEffect(() => {
        if (!socket) return;

        socket.on('onlineUsers', (users: OnlineUser[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('onlineUsers');
        };
    }, [socket]);

    const handleStartPrivateChat = (targetUserId: string, targetUserName: string) => {
        startPrivateChat(targetUserId, targetUserName);
    };

    const handleStatusChange = (status: keyof typeof statusConfig) => {
        if (!user?.id) return;

        // Atualiza o estado local
        setCurrentStatus(status);

        // Persiste no localStorage
        localStorage.setItem(`userStatus_${user.id}`, status);

        // Envia para o servidor
        if (socket) {
            socket.emit('updateStatus', {
                userId: user.id,
                status
            });
        }
    };

    if (!user || !socket) return null;

    return (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {user.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.sector || 'Geral'}
                        </p>
                    </div>
                </div>
                <UserStatusSelector
                    currentStatus={currentStatus}
                    onStatusChange={handleStatusChange}
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                <OnlineUsersList
                    users={onlineUsers}
                    onStartPrivateChat={handleStartPrivateChat}
                    currentUserId={user.id}
                />
            </div>
        </div>
    );
};