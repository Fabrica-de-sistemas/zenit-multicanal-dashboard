// components/dashboard/Header.tsx
import React, { useState, useRef } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  useClickOutside(menuRef, () => {
    if (isMenuOpen) setIsMenuOpen(false);
  });

  const handleLogout = () => {
    logout();
  };

  // Se não houver usuário, pode mostrar um loading ou retornar null
  if (!user) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 justify-between relative">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">Central de Atendimento</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
        >
          {user.fullName.charAt(0).toUpperCase()}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Informações do Usuário */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-medium">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => router.push('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Meu Perfil</span>
              </button>
              
              <button
                onClick={() => router.push('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>

            {/* Separador */}
            <div className="border-t border-gray-200 my-1"></div>

            {/* Botão de Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};