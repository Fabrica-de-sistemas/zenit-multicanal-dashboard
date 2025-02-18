// frontend/components/admin/UserPermissionManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Permission } from '@/config/permissions';

interface User {
    id: string;
    fullName: string;
    email: string;
    sector: string;
    role: string;
}

const permissionLabels: Record<Permission, string> = {
    'view_tickets': 'Acesso ao Dashboard',
    'manage_tickets': 'Gerenciar Tickets',
    'view_chat': 'Acesso ao Chat Interno',
    'manage_users': 'Acesso às Configurações',
    'view_marketing_analytics': 'Visualizar Analytics de Marketing',
    'manage_marketing_campaigns': 'Gerenciar Campanhas de Marketing',
    'manage_financial_reports': 'Gerenciar Relatórios Financeiros',
    'view_hr_data': 'Visualizar Dados de RH'
};

export default function UserPermissionsManager() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [tempPermissions, setTempPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Carregar usuários
    useEffect(() => {
        fetchUsers();
    }, []);

    // Carregar permissões quando selecionar um usuário
    useEffect(() => {
        if (selectedUser) {
            fetchUserPermissions(selectedUser.id);
        }
    }, [selectedUser]);

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
            setLoading(false);
        } catch (err) {
            setError('Erro ao carregar usuários');
            console.error(err);
            setLoading(false);
        }
    };

    const fetchUserPermissions = async (userId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/permissions/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar permissões');

            const permissions = await response.json();
            setTempPermissions(Array.isArray(permissions) ? permissions : []);
            setHasChanges(false);
        } catch (error) {
            console.error('Erro ao buscar permissões:', error);
            setError('Erro ao carregar permissões do usuário');
        }
    };

    const handlePermissionChange = (permission: Permission, enabled: boolean) => {
        const newPermissions = enabled
            ? [...tempPermissions, permission]
            : tempPermissions.filter(p => p !== permission);

        setTempPermissions(newPermissions);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!selectedUser || isSaving) return;

        try {
            setIsSaving(true);

            const response = await fetch(
                `http://localhost:8080/api/admin/permissions/users/${selectedUser.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ permissions: tempPermissions })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao atualizar permissões');
            }

            // Atualizar o token
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.reload(); // Recarrega a página para aplicar as novas permissões
            }

            setHasChanges(false);
            alert('Permissões salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar permissões:', error);
            alert('Erro ao salvar permissões');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (selectedUser) {
            fetchUserPermissions(selectedUser.id);
        }
    };

    // Filtrar usuários
    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
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

                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full text-left p-3 rounded-lg ${selectedUser?.id === user.id
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
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-medium text-lg">{selectedUser.fullName}</h3>
                                <p className="text-gray-500">{selectedUser.sector} • {selectedUser.role}</p>
                            </div>
                            {hasChanges && (
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                </div>
                            )}
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
                                        disabled={isSaving}
                                        checked={tempPermissions.includes(permission as Permission)}
                                        onCheckedChange={(checked) =>
                                            handlePermissionChange(permission as Permission, checked)
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