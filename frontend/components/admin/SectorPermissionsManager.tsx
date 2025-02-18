// frontend/components/admin/SectorPermissionsManager.tsx
'use client';

import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/hooks/useAuth';
import { Permission } from '@/config/permissions';

interface SectorWithPermissions {
    id: string;
    name: string;
    permissions: Permission[];
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

function SectorPermissionsManager() {
    const [sectors, setSectors] = useState<SectorWithPermissions[]>([]);
    const [selectedSector, setSelectedSector] = useState<SectorWithPermissions | null>(null);
    const { user } = useAuth();

    const handlePermissionToggle = async (permission: Permission, enabled: boolean) => {
        if (!selectedSector) return;

        const newPermissions = enabled 
            ? [...selectedSector.permissions, permission]
            : selectedSector.permissions.filter((p: Permission) => p !== permission);

        try {
            const response = await fetch(`/api/sectors/${selectedSector.id}/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ permissions: newPermissions })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar permissões');
            }

            setSectors(prev => prev.map(sector => 
                sector.id === selectedSector.id 
                    ? { ...sector, permissions: newPermissions }
                    : sector
            ));
        } catch (error) {
            console.error('Erro ao atualizar permissões:', error);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Lista de Setores */}
            <div className="col-span-4">
                {sectors.map((sector) => (
                    <button 
                        key={sector.id}
                        onClick={() => setSelectedSector(sector)}
                        className={`p-4 ${selectedSector?.id === sector.id ? 'bg-blue-50' : ''}`}
                    >
                        {sector.name}
                    </button>
                ))}
            </div>

            {/* Permissões do Setor */}
            <div className="col-span-8">
                {selectedSector && (
                    <div>
                        <h2>{selectedSector.name}</h2>
                        {Object.entries(permissionLabels).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between p-4">
                                <span>{label}</span>
                                <Switch
                                    checked={selectedSector.permissions.includes(key as Permission)}
                                    onCheckedChange={(checked: boolean) => 
                                        handlePermissionToggle(key as Permission, checked)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SectorPermissionsManager;