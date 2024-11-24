import React from 'react';
import { Search } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">Central de Atendimento</h1>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar tickets..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
          AT
        </div>
      </div>
    </header>
  );
};