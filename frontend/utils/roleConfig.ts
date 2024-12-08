// frontend/utils/roleConfig.ts
export const sectorRoles = {
    'Desenvolvimento': [
      'Desenvolvedor Junior',
      'Desenvolvedor Pleno',
      'Desenvolvedor Sênior',
      'Tech Lead',
      'Arquiteto de Software'
    ],
    'Design': [
      'Designer Junior',
      'Designer Pleno',
      'Designer Sênior',
      'UI/UX Designer',
      'Diretor de Arte'
    ],
    'Marketing': [
      'Analista de Marketing Junior',
      'Analista de Marketing Pleno',
      'Analista de Marketing Sênior',
      'Coordenador de Marketing',
      'Gerente de Marketing'
    ],
    'RH': [
      'Assistente de RH',
      'Analista de RH',
      'Coordenador de RH',
      'Gerente de RH'
    ],
    'Financeiro': [
      'Assistente Financeiro',
      'Analista Financeiro Junior',
      'Analista Financeiro Pleno',
      'Analista Financeiro Sênior',
      'Controller',
      'Gerente Financeiro'
    ],
    'Comercial': [
      'Vendedor Junior',
      'Vendedor Pleno',
      'Vendedor Sênior',
      'Coordenador Comercial',
      'Gerente Comercial'
    ],
    'Suporte': [
      'Analista de Suporte Junior',
      'Analista de Suporte Pleno',
      'Analista de Suporte Sênior',
      'Coordenador de Suporte',
      'Gerente de Suporte'
    ],
    'Geral': [
      'ADMIN',
      'Diretor',
      'Gerente Geral',
      'Coordenador Geral'
    ]
  } as const;
  
  export type Sector = keyof typeof sectorRoles;
  export type Role = typeof sectorRoles[Sector][number];