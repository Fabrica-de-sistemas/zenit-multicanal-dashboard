// frontend/src/components/chat/OnlineUsersList.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ArrowUpDown } from 'lucide-react';
import { OnlineUser, SortType } from '@/types/chatTypes';
import { statusConfig } from '@/config/statusConfig';

interface OnlineUsersListProps {
  users: OnlineUser[];
}

export const OnlineUsersList = ({ users }: OnlineUsersListProps) => {
  const [sortType, setSortType] = useState<SortType>('az');

  const sortUsers = (users: OnlineUser[]): OnlineUser[] => {
    return [...users].sort((a, b) => {
      if (sortType === 'az') return a.name.localeCompare(b.name);
      if (sortType === 'za') return b.name.localeCompare(a.name);
      return a.sector.localeCompare(b.sector) || a.name.localeCompare(b.name);
    });
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">Colaboradores</h3>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          className="text-xs text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer"
        >
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="sector">Por Setor</option>
        </select>
      </div>

      {/* Lista de Colaboradores */}
      <div className="space-y-4">
        {sortType === 'sector' ? (
          Object.entries(
            sortUsers(users).reduce((acc, user) => {
              if (!acc[user.sector]) acc[user.sector] = [];
              acc[user.sector].push(user);
              return acc;
            }, {} as Record<string, OnlineUser[]>)
          ).map(([sector, sectorUsers]) => (
            <div key={sector} className="space-y-2">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2">{sector}</h4>
              {sectorUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ))
        ) : (
          sortUsers(users).map(user => (
            <UserCard key={user.id} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

const UserCard = ({ user }: { user: OnlineUser }) => (
  <button className="w-full group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
    <div className="relative">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        {user.name.charAt(0)}
      </div>
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${statusConfig[user.status].color} ring-2 ring-white`} />
    </div>
    <div className="flex-1 min-w-0 text-left">
      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
      <p className="text-xs text-gray-500 truncate">{user.role}</p>
    </div>
  </button>
);