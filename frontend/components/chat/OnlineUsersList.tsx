// frontend/src/components/chat/OnlineUsersList.tsx
import React from 'react';
import { statusConfig } from '@/config/statusConfig';
import { OnlineUser } from '@/types/chatTypes';
import { MessageCircle } from 'lucide-react';

interface OnlineUsersListProps {
    users: OnlineUser[];
    onStartPrivateChat: (userId: string, userName: string) => void;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ users, onStartPrivateChat }) => {
    return (
        <div className="p-4 space-y-4">
            <div className="text-sm font-medium text-gray-500">
                Colaboradores Online ({users.length})
            </div>
            <div className="space-y-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                {user.name.charAt(0)}
                            </div>
                            <div 
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    statusConfig[user.status].color
                                }`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user.sector} • {user.role}
                            </p>
                        </div>
                        <button
                            onClick={() => onStartPrivateChat(user.id, user.name)}
                            className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                            aria-label={`Iniciar chat privado com ${user.name}`}
                            title={`Iniciar chat privado com ${user.name}`}
                        >
                            <MessageCircle size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};