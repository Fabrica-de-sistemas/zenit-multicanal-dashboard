// frontend/src/components/chat/OnlineUsersList.tsx
import React from 'react';
import { statusConfig } from '@/config/statusConfig';
import { OnlineUser } from '@/types/chatTypes';

interface OnlineUsersListProps {
  users: OnlineUser[];
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ users }) => {
  return (
    <div className="p-4 space-y-4">
      <div className="text-sm font-medium text-gray-500">
        Colaboradores Online ({users.length})
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {user.name.charAt(0)}
              </div>
              <div 
                className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                  statusConfig[user.status].color
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <div className="flex items-center text-xs text-gray-500 space-x-1">
                <span className="truncate">{user.sector}</span>
                <span>•</span>
                <span className="truncate">{user.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};