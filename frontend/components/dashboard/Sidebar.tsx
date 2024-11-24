import React from 'react';
import { Bell, MessageSquare, Settings, Users } from 'lucide-react';

export const Sidebar = () => {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-6 space-y-8">
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
        AC
      </div>
      <nav className="flex flex-col space-y-6">
        <button className="p-3 text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors">
          <MessageSquare size={20} />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <Users size={20} />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <Settings size={20} />
        </button>
      </nav>
    </div>
  );
};