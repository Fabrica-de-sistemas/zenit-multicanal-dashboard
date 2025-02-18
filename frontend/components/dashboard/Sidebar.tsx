// frontend/src/components/dashboard/Sidebar.tsx
'use client';

import React from 'react';
import { Bell, MessageSquare, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

export const Sidebar = () => {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-6 space-y-8">
      {/* Logo */}
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
        AC
      </div>

      <nav className="flex flex-col space-y-6">
        {/* Dashboard - Requer view_tickets */}
        {hasPermission('view_tickets') && (
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            title="Dashboard"
          >
            <MessageSquare size={20} />
          </button>
        )}

        {/* Chat Interno - Requer view_chat */}
        {hasPermission('view_chat') && (
          <button 
            onClick={() => router.push('/dashboard/company-chat')}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            title="Chat Interno"
          >
            <Users size={20} />
          </button>
        )}

        {/* Configurações - Requer manage_users */}
        {hasPermission('manage_users') && (
          <button 
            onClick={() => router.push('/dashboard/settings')}
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
            title="Configurações"
          >
            <Settings size={20} />
          </button>
        )}
      </nav>
    </div>
  );
};