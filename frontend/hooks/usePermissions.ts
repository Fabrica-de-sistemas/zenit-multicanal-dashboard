// frontend/hooks/usePermissions.ts
import { useAuth } from './useAuth';
import { Permission, sectorPermissions, adminPermissions } from '@/config/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // Admins têm todas as permissões
    if (user.role === 'ADMIN') {
      return adminPermissions.includes(permission);
    }

    // Verifica permissões do setor
    const userSectorPermissions = sectorPermissions[user.sector] || [];
    return userSectorPermissions.includes(permission);
  };

  return { hasPermission };
}