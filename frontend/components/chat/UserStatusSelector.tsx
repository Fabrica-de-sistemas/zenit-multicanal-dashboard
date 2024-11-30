// frontend/src/components/chat/UserStatusSelector.tsx
'use client';

import { useState } from 'react';
import { UserStatus } from '@/types/chatTypes';

const statusConfig = {
  available: {
    label: 'Disponível',
    color: 'bg-emerald-500',
    ringColor: 'hover:ring-emerald-500/20',
    dotRing: 'ring-emerald-500/20'
  },
  away: {
    label: 'Ausente',
    color: 'bg-amber-500',
    ringColor: 'hover:ring-amber-500/20',
    dotRing: 'ring-amber-500/20'
  },
  meeting: {
    label: 'Reunião',
    color: 'bg-rose-500',
    ringColor: 'hover:ring-rose-500/20',
    dotRing: 'ring-rose-500/20'
  }
} as const;

interface UserStatusSelectorProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
}

export const UserStatusSelector = ({ currentStatus, onStatusChange }: UserStatusSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-1 px-2 rounded-md hover:bg-gray-50 transition-all duration-200"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[currentStatus].color} ring-4 ${statusConfig[currentStatus].dotRing}`} />
        <span>{statusConfig[currentStatus].label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status as UserStatus);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${config.ringColor} transition-all duration-200`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${config.color} ring-4 ${config.dotRing}`} />
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};