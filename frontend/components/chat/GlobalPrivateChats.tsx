// frontend/components/chat/GlobalPrivateChats.tsx
'use client';

import React from 'react';
import { usePrivateChat } from '@/contexts/PrivateChatContext';
import { useAuth } from '@/hooks/useAuth';
import { PrivateChat } from './PrivateChat';

export function GlobalPrivateChats() {
    const { privateChats, minimizeChat, closeChat } = usePrivateChat();
    const { user } = useAuth();

    if (!user) return null;

    return (
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
                        fromUserId={user.id}
                        fromUserName={user.fullName}
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
    );
}