// frontend/components/admin/UserCustomPermissions.tsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Permission } from '@/config/permissions';
import { Switch } from "@/components/ui/switch";

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    sector: string;
}

const permissionLabels: Record<Permission, string> = {
    'view_tickets': 'Visualizar Tickets',
    'manage_tickets': 'Gerenciar Tickets',
    'view_chat': 'Acessar Chat',
    'manage_users': 'Gerenciar Usuários',
    'view_marketing_analytics': 'Visualizar Analytics de Marketing',
    'manage_marketing_campaigns': 'Gerenciar Campanhas de Marketing',
    'manage_financial_reports': 'Gerenciar Relatórios Financeiros',
    'view_hr_data': 'Visualizar Dados de RH'
};

function UserCustomPermissions() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [customPermissions, setCustomPermissions] = useState<Permission[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar lista de usuários
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/admin/users', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) throw new Error('Erro ao carregar usuários');
                
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError('Falha ao carregar lista de usuários');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Carregar permissões customizadas quando um usuário é selecionado
    useEffect(() => {
        if (!selectedUser) return;

        const fetchCustomPermissions = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/users/${selectedUser.id}/custom-permissions`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                if (!response.ok) throw new Error('Erro ao carregar permissões');
                
                const data = await response.json();
                setCustomPermissions(data.permissions);
            } catch (error) {
                setError('Falha ao carregar permissões do usuário');
            }
        };

        fetchCustomPermissions();
    }, [selectedUser]);

    const handleCustomPermissionToggle = async (permission: Permission, enabled: boolean) => {
        if (!selectedUser) return;

        const newPermissions = enabled
            ? [...customPermissions, permission]
            : customPermissions.filter(p => p !== permission);

        try {
            const response = await fetch(
                `http://localhost:8080/api/users/${selectedUser.id}/custom-permissions`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ permissions: newPermissions })
                }
            );

            if (!response.ok) throw new Error('Erro ao atualizar permissões');

            setCustomPermissions(newPermissions);
        } catch (error) {
            setError('Falha ao atualizar permissões');
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Lista de Usuários */}
            <div className="col-span-4 bg-white p-4 rounded-lg border border-gray-200">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-3 rounded-lg ${
                                selectedUser?.id === user.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'hover:bg-gray-50 border-transparent'
                            } border`}
                        >
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.sector} • {user.role}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Permissões do Usuário */}
            <div className="col-span-8 bg-white p-4 rounded-lg border border-gray-200">
                {selectedUser ? (
                    <>
                        <div className="mb-6">
                            <h3 className="font-medium text-lg">{selectedUser.fullName}</h3>
                            <p className="text-gray-500">{selectedUser.sector} • {selectedUser.role}</p>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(permissionLabels).map(([permission, label]) => (
                                <div
                                    key={permission}
                                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                                >
                                    <div>
                                        <p className="font-medium">{label}</p>
                                        <p className="text-sm text-gray-500">{permission}</p>
                                    </div>
                                    <Switch
                                        checked={customPermissions.includes(permission as Permission)}
                                        onCheckedChange={(checked) => 
                                            handleCustomPermissionToggle(permission as Permission, checked)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Selecione um usuário para gerenciar suas permissões
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserCustomPermissions;