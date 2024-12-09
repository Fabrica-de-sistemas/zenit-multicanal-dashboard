// backend/src/config/permissions.ts
export type Permission = 
  | 'view_tickets' 
  | 'manage_tickets'
  | 'view_chat'
  | 'manage_users'
  | 'view_marketing_analytics'
  | 'manage_marketing_campaigns'
  | 'manage_financial_reports'
  | 'view_hr_data';

export const sectorPermissions: Record<string, Permission[]> = {
  'Suporte': [
    'view_tickets',
    'manage_tickets',
    'view_chat'
  ],
  'Marketing': [
    'view_chat',
    'view_marketing_analytics',
    'manage_marketing_campaigns'
  ],
  'RH': [
    'view_chat',
    'view_hr_data',
    'manage_users'
  ],
  'Desenvolvimento': [
    'view_chat',
    'view_tickets'
  ],
  'Design': [
    'view_chat'
  ],
  'Financeiro': [
    'view_chat',
    'manage_financial_reports'
  ],
  'Comercial': [
    'view_chat',
    'view_marketing_analytics'
  ],
  'Geral': [
    'view_chat',
    'manage_users',
    'manage_tickets',
    'view_tickets',
    'view_marketing_analytics',
    'manage_marketing_campaigns',
    'manage_financial_reports',
    'view_hr_data'
  ]
};

export const adminPermissions: Permission[] = [
  'view_tickets',
  'manage_tickets',
  'view_chat',
  'manage_users',
  'view_marketing_analytics',
  'manage_marketing_campaigns',
  'manage_financial_reports',
  'view_hr_data'
];