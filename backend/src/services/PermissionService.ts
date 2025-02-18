// backend/src/services/PermissionService.ts
import { EventEmitter } from 'events';
import { Permission } from '../config/permissions';
import { query, execute } from '../lib/db';

interface PermissionEvent {
    userId: string;
    permissions: Permission[];
}

class PermissionService extends EventEmitter {
    private static instance: PermissionService;
    private userPermissions: Map<string, Permission[]> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): PermissionService {
        if (!PermissionService.instance) {
            PermissionService.instance = new PermissionService();
        }
        return PermissionService.instance;
    }

    async loadUserPermissions(userId: string): Promise<Permission[]> {
        try {
            const [result] = await query(
                'SELECT permissions FROM user_permissions WHERE user_id = ?',
                [userId]
            );
    
            if (!result || !result.permissions) {
                return [];
            }
    
            const permissions = result.permissions as Permission[];
            this.userPermissions.set(userId, permissions);
            
            return permissions;
        } catch (error) {
            console.error('Erro ao carregar permissões:', error);
            return [];
        }
    }

    async updateUserPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
        try {
            await execute(
                `INSERT INTO user_permissions (id, user_id, permissions) 
                VALUES (UUID(), ?, ?)
                ON DUPLICATE KEY UPDATE permissions = ?`,
                [userId, permissions, permissions]
            );

            this.userPermissions.set(userId, permissions);
            
            // Emite evento com tipagem correta
            this.emit('permissionsUpdated', {
                userId,
                permissions
            } as PermissionEvent);

            return true;
        } catch (error) {
            console.error('Erro ao atualizar permissões:', error);
            return false;
        }
    }

    getUserPermissions(userId: string): Permission[] {
        return this.userPermissions.get(userId) || [];
    }

    // Sobrescreve o método on do EventEmitter para incluir tipagem
    on(event: 'permissionsUpdated', listener: (data: PermissionEvent) => void): this {
        return super.on(event, listener);
    }
}

export default PermissionService;