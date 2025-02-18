// frontend/components/admin/PermissionsManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, UserCog } from 'lucide-react';
import { Permission } from '@/config/permissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import dynamic from 'next/dynamic';
import { permissionService } from '@/services/permissionService';

// Importação dinâmica do UserPermissionsManager
const UserPermissionsManager = dynamic(() => import('./UserPermissionManager'), {
    loading: () => <div>Carregando...</div>
});

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

interface SectorPermissions {
    [sector: string]: Permission[];
}

export function PermissionsManager() {
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [sectorPerms, setSectorPerms] = useState<SectorPermissions>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                setLoading(true);
                const permissions = await permissionService.getAllSectorPermissions();
                setSectorPerms(permissions);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar permissões');
            } finally {
                setLoading(false);
            }
        };

        loadPermissions();
    }, []);

    const handlePermissionChange = async (sector: string, permission: Permission, checked: boolean) => {
        try {
            setIsSaving(true);

            // Pega as permissões atuais do setor
            const currentPermissions = sectorPerms[sector] || [];

            // Cria o novo array de permissões
            const updatedPermissions = checked
                ? [...currentPermissions, permission]
                : currentPermissions.filter(p => p !== permission);

            // Envia a atualização para o servidor primeiro
            await permissionService.updateSectorPermissions(sector, updatedPermissions);

            // Se chegou aqui, a atualização foi bem sucedida, então atualiza o estado local
            setSectorPerms(prev => ({
                ...prev,
                [sector]: updatedPermissions
            }));
        } catch (error) {
            console.error('Erro ao atualizar permissões:', error);
            // Recarrega as permissões em caso de erro
            const permissions = await permissionService.getAllSectorPermissions();
            setSectorPerms(permissions);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">
                Erro: {error}
                <button
                    onClick={() => window.location.reload()}
                    className="ml-4 text-blue-500 hover:underline"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Gerenciar Permissões</h2>
                <p className="text-gray-500">Configure as permissões por cargo ou usuário</p>
            </div>

            <Tabs defaultValue="roles">
                <TabsList>
                    <TabsTrigger value="roles">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            <span>Permissões por Cargo</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4" />
                            <span>Permissões por Usuário</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Coluna de Setores */}
                        <div className="col-span-3 bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="font-medium mb-4">Setores</h3>
                            <div className="space-y-2">
                                {Object.keys(sectorPerms).map((sector) => (
                                    <button
                                        key={sector}
                                        onClick={() => setSelectedSector(sector)}
                                        className={`w-full text-left px-4 py-2 rounded-lg ${selectedSector === sector
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {sector}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Coluna de Permissões */}
                        <div className="col-span-9 bg-white p-4 rounded-lg border border-gray-200">
                            {selectedSector ? (
                                <>
                                    <h3 className="font-medium mb-4">
                                        Permissões do setor: {selectedSector}
                                    </h3>
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
                                                    checked={sectorPerms[selectedSector]?.includes(permission as Permission)}
                                                    onCheckedChange={(checked: boolean) =>
                                                        handlePermissionChange(selectedSector, permission as Permission, checked)
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    Selecione um setor para visualizar suas permissões
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <UserPermissionsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}