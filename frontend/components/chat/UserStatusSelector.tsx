// frontend/src/components/chat/UserStatusSelector.tsx
import React, { useState } from 'react';
import { statusConfig } from '@/config/statusConfig';

interface UserStatusSelectorProps {
  currentStatus: keyof typeof statusConfig;
  onStatusChange: (status: keyof typeof statusConfig) => void;
}

export const UserStatusSelector: React.FC<UserStatusSelectorProps> = ({
  currentStatus,
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 w-full"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[currentStatus].color}`} />
        <span className="text-sm text-gray-700">{statusConfig[currentStatus].label}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status as keyof typeof statusConfig);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 text-left"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
              <span className="text-sm text-gray-700">{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};