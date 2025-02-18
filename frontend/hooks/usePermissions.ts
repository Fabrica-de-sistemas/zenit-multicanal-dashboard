// frontend/hooks/usePermissions.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Permission } from '@/config/permissions';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  email: string;
  role?: string;
  sector?: string;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const loadPermissions = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setPermissions(decoded.permissions || []);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        setPermissions([]);
      }
    };

    loadPermissions();

    // Adiciona listener para atualização do localStorage
    window.addEventListener('storage', loadPermissions);

    return () => {
      window.removeEventListener('storage', loadPermissions);
    };
  }, [user?.id]); // Recarrega quando o usuário mudar

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Admin tem todas as permissões
    if (user.role === 'ADMIN') {
      return true;
    }

    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Verifica se o token não está expirado
      if (decoded.exp < Date.now() / 1000) {
        return false;
      }
      return decoded.permissions?.includes(permission) || false;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserPermissions = (): Permission[] => {
    if (!user) return [];

    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.permissions || [];
    } catch {
      return [];
    }
  };

  const refreshPermissions = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPermissions([]);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setPermissions(decoded.permissions || []);
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      setPermissions([]);
    }
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    refreshPermissions,
    permissions
  };
}