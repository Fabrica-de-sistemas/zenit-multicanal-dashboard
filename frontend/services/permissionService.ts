// frontend/services/permissionService.ts
import { Permission } from '@/config/permissions';
import { useAuthFetch } from '@/hooks/useAuthFetch';

interface SectorPermissions {
  [sector: string]: Permission[];
}

interface UserCustomPermissions {
  userId: string;
  permissions: Permission[];
}

export const permissionService = {
  // Buscar todas as permissões dos setores
  async getAllSectorPermissions(): Promise<SectorPermissions> {
    const { authFetch } = useAuthFetch();
    try {
      const response = await authFetch('http://localhost:8080/api/admin/permissions/sectors');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      throw new Error('Erro ao buscar permissões dos setores');
    }
  },

  // Atualizar permissões de um setor
  async updateSectorPermissions(sector: string, permissions: Permission[]): Promise<void> {
    const { authFetch } = useAuthFetch();
    try {
      const response = await authFetch(
        `http://localhost:8080/api/admin/permissions/sectors/${sector}`,
        {
          method: 'PUT',
          body: JSON.stringify({ permissions })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar permissões do setor');
      }

      // Se necessário, emitir evento via Socket.IO
      window.socket?.emit('sectorPermissionsUpdated', { sector, permissions });
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  },

  // Buscar permissões customizadas de um usuário
  async getUserCustomPermissions(userId: string): Promise<Permission[]> {
    const { authFetch } = useAuthFetch();
    try {
      const response = await authFetch(
        `http://localhost:8080/api/admin/permissions/users/${userId}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar permissões do usuário');
      }

      const data = await response.json();
      return Array.isArray(data.permissions) ? data.permissions : [];
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      throw error;
    }
  },

  // Atualizar permissões customizadas de um usuário
  async updateUserCustomPermissions(userId: string, permissions: Permission[]): Promise<void> {
    const { authFetch } = useAuthFetch();
    try {
      const response = await authFetch(
        `http://localhost:8080/api/admin/permissions/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ permissions })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar permissões do usuário');
      }

      const data = await response.json();

      // Se o usuário modificado for o usuário atual
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      if (currentUser.id === userId) {
        localStorage.setItem('token', data.token);

        // Atualiza as permissões no userData também
        currentUser.permissions = permissions;
        localStorage.setItem('userData', JSON.stringify(currentUser));

        // Emite evento para outros componentes saberem da mudança
        window.dispatchEvent(new Event('permissionsUpdated'));

        // Força um reload apenas se for o usuário atual
        window.location.reload();
      } else {
        // Se for outro usuário, emite evento via Socket.IO
        window.socket?.emit('userPermissionsUpdated', { userId, permissions });
      }
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  },

  // Verificar se usuário tem uma permissão específica
  hasPermission(permission: Permission): boolean {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return userData.permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  },

  // Retorna todas as permissões do usuário atual
  getCurrentUserPermissions(): Permission[] {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      return Array.isArray(userData.permissions) ? userData.permissions : [];
    } catch {
      return [];
    }
  }
};