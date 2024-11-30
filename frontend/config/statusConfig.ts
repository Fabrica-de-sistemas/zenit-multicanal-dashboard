// frontend/src/config/statusConfig.ts
export const statusConfig = {
    available: {
      label: 'Disponível',
      color: 'bg-green-500',
      ringColor: 'ring-green-50'
    },
    away: {
      label: 'Ausente',
      color: 'bg-yellow-500',
      ringColor: 'ring-yellow-50'
    },
    meeting: {
      label: 'Reunião',
      color: 'bg-red-500',
      ringColor: 'ring-red-50'
    }
  } as const;