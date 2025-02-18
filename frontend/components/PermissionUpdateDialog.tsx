// frontend/components/PermissionUpdateDialog.tsx
import React from 'react';
import { Permission } from '@/config/permissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PermissionUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNow: () => void;
  onApplyLater: () => void;
  addedPermissions?: Permission[];    // Tornando opcional
  removedPermissions?: Permission[];  // Tornando opcional
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

export function PermissionUpdateDialog({
  isOpen,
  onClose,
  onApplyNow,
  onApplyLater,
  addedPermissions = [],      // Valor padrão
  removedPermissions = []     // Valor padrão
}: PermissionUpdateDialogProps) {
  // Usando verificação extra por segurança
  const added = Array.isArray(addedPermissions) ? addedPermissions : [];
  const removed = Array.isArray(removedPermissions) ? removedPermissions : [];
  
  const hasOnlyAdditions = added.length > 0 && removed.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suas permissões foram atualizadas</DialogTitle>
          <DialogDescription>
            Um administrador modificou suas permissões de acesso.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {added.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Permissões Adicionadas:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {added.map(permission => (
                  <li key={permission} className="text-sm text-green-600">
                    {permissionLabels[permission]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {removed.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Permissões Removidas:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {removed.map(permission => (
                  <li key={permission} className="text-sm text-red-600">
                    {permissionLabels[permission]}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          {hasOnlyAdditions ? (
            <Button onClick={onApplyNow}>
              Aplicar Agora
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={onApplyLater}>
                Aplicar no Próximo Login
              </Button>
              <Button onClick={onApplyNow}>
                Aplicar Agora
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}