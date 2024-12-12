// frontend/contexts/PrivateChatContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { PrivateChat } from '@/components/chat/PrivateChat';

interface PrivateChatState {
    userId: string;
    userName: string;
    isMinimized: boolean;
    hasNewMessage: boolean;
}

interface PrivateChatContextData {
    privateChats: PrivateChatState[];
    startPrivateChat: (userId: string, userName: string) => void;
    minimizeChat: (userId: string) => void;
    closeChat: (userId: string) => void;
}

const PrivateChatContext = createContext<PrivateChatContextData>({} as PrivateChatContextData);

export function PrivateChatProvider({ children }: { children: React.ReactNode }) {
    const [privateChats, setPrivateChats] = useState<PrivateChatState[]>([]);
    const socket = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (!socket || !user) return;

        // Escuta novas mensagens privadas
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
                    return [...prev, {
                        userId: message.userId,
                        userName: message.userName,
                        isMinimized: false,
                        hasNewMessage: false
                    }];
                });
            }
        });

        return () => {
            socket.off('newPrivateMessage');
        };
    }, [socket, user]);

    const startPrivateChat = (userId: string, userName: string) => {
        setPrivateChats(prev => {
            const existingChat = prev.find(chat => chat.userId === userId);
            if (existingChat) {
                return prev.map(chat => 
                    chat.userId === userId 
                        ? { ...chat, isMinimized: false, hasNewMessage: false }
                        : chat
                );
            }
            return [...prev, {
                userId,
                userName,
                isMinimized: false,
                hasNewMessage: false
            }];
        });
    };

    const minimizeChat = (userId: string) => {
        setPrivateChats(prev => prev.map(chat => 
            chat.userId === userId 
                ? { ...chat, isMinimized: !chat.isMinimized }
                : chat
        ));
    };

    const closeChat = (userId: string) => {
        setPrivateChats(prev => prev.filter(chat => chat.userId !== userId));
    };

    return (
        <PrivateChatContext.Provider value={{
            privateChats,
            startPrivateChat,
            minimizeChat,
            closeChat
        }}>
            {children}
            <div className="fixed bottom-0 right-0 flex flex-row-reverse gap-4 p-4 z-50">
                {privateChats.map((chat, index) => (
                    <div 
                        key={chat.userId} 
                        style={{ 
                            right: `${(index * 288) + 16}px`
                        }}
                        className="absolute bottom-0"
                    >
                        <PrivateChat
                            fromUserId={user?.id || ''}
                            fromUserName={user?.fullName || ''}
                            toUserId={chat.userId}
                            toUserName={chat.userName}
                            onClose={() => closeChat(chat.userId)}
                            onMinimize={() => minimizeChat(chat.userId)}
                            isMinimized={chat.isMinimized}
                            hasNewMessage={chat.hasNewMessage}
                        />
                    </div>
                ))}
            </div>
        </PrivateChatContext.Provider>
    );
}

export const usePrivateChat = () => useContext(PrivateChatContext);