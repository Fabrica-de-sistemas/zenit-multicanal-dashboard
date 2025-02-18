// frontend\components\chat\ChatSidebar.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OnlineUsersList } from './OnlineUsersList';
import { UserStatusSelector } from './UserStatusSelector';
import { useStatus } from '@/contexts/StatusContext';
import { usePrivateChat } from '@/contexts/PrivateChatContext';

export const ChatSidebar = () => {
    const { user } = useAuth();
    const { currentStatus, setUserStatus, onlineUsers } = useStatus();
    const { startPrivateChat } = usePrivateChat();

    const handleStartPrivateChat = (targetUserId: string, targetUserName: string) => {
        startPrivateChat(targetUserId, targetUserName);
    };

    if (!user) return null;

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
                    onStatusChange={setUserStatus}
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