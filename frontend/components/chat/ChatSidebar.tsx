// frontend/src/components/chat/ChatSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { OnlineUsersList } from './OnlineUsersList';
import { UserStatusSelector } from './UserStatusSelector';
import { OnlineUser } from '@/types/chatTypes';
import { statusConfig } from '@/config/statusConfig';
import { PrivateChat } from './PrivateChat';

interface PrivateChatState {
  userId: string;
  userName: string;
  isMinimized: boolean;
  hasNewMessage: boolean;
}

export const ChatSidebar = () => {
    const socket = useSocket();
    const { user } = useAuth();
    const [currentStatus, setCurrentStatus] = useState<keyof typeof statusConfig>('available');
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [privateChats, setPrivateChats] = useState<PrivateChatState[]>([]);

    useEffect(() => {
        if (!socket || !user) return;

        const emitUserConnected = () => {
            socket.emit('userConnected', {
                id: user.id,
                name: user.fullName,
                role: user.role,
                sector: user.sector || 'Geral',
                status: currentStatus
            });
        };

        emitUserConnected();

        socket.on('onlineUsers', (users: OnlineUser[]) => {
            setOnlineUsers(users);
        });

        socket.on('newPrivateMessage', (message) => {
            if (message.toUserId === user.id) {
                setPrivateChats(prev => {
                    const existingChat = prev.find(chat => chat.userId === message.userId);
                    if (existingChat) {
                        if (existingChat.isMinimized) {
                            return prev.map(chat => 
                                chat.userId === message.userId 
                                    ? { ...chat, hasNewMessage: true }
                                    : chat
                            );
                        }
                        return prev;
                    }
                    // Se não existir chat, cria um novo
                    return [...prev, {
                        userId: message.userId,
                        userName: message.userName,
                        isMinimized: false,
                        hasNewMessage: true
                    }];
                });
            }
        });

        return () => {
            socket.off('onlineUsers');
            socket.off('newPrivateMessage');
        };
    }, [socket, user, currentStatus]);

    const handleStartPrivateChat = (targetUserId: string, targetUserName: string) => {
        if (!user || !socket) return;
        
        setPrivateChats(prev => {
            const existingChat = prev.find(chat => chat.userId === targetUserId);
            if (existingChat) {
                return prev.map(chat => 
                    chat.userId === targetUserId 
                        ? { ...chat, isMinimized: false, hasNewMessage: false }
                        : chat
                );
            }
            return [...prev, {
                userId: targetUserId,
                userName: targetUserName,
                isMinimized: false,
                hasNewMessage: false
            }];
        });
    };

    const handleMinimizeChat = (userId: string) => {
        setPrivateChats(prev => 
            prev.map(chat => 
                chat.userId === userId 
                    ? { ...chat, isMinimized: !chat.isMinimized, hasNewMessage: false }
                    : chat
            )
        );
    };

    const handleCloseChat = (userId: string) => {
        setPrivateChats(prev => prev.filter(chat => chat.userId !== userId));
    };

    if (!user || !socket) return null;

    return (
        <>
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
                        onStatusChange={(status) => {
                            setCurrentStatus(status);
                            if (socket) {
                                socket.emit('updateStatus', {
                                    userId: user.id,
                                    status
                                });
                            }
                        }}
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    <OnlineUsersList 
                        users={onlineUsers} 
                        onStartPrivateChat={handleStartPrivateChat}
                    />
                </div>
            </div>

            {/* Chats privados */}
            {privateChats.map((chat) => (
                <PrivateChat
                    key={chat.userId}
                    fromUserId={user.id}
                    fromUserName={user.fullName}
                    toUserId={chat.userId}
                    toUserName={chat.userName}
                    onClose={() => handleCloseChat(chat.userId)}
                    onMinimize={() => handleMinimizeChat(chat.userId)}
                    isMinimized={chat.isMinimized}
                    hasNewMessage={chat.hasNewMessage}
                />
            ))}
        </>
    );
};