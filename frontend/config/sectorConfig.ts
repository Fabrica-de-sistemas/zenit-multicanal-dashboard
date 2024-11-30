// frontend/src/config/sectorConfig.ts
export const sectors = [
    'Desenvolvimento',
    'Design',
    'Marketing',
    'RH',
    'Financeiro',
    'Comercial',
    'Suporte',
    'Geral'
  ] as const;
  
  export type Sector = typeof sectors[number];