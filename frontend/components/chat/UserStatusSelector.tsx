// frontend/src/components/chat/UserStatusSelector.tsx
import React, { useState } from 'react';
import { statusConfig } from '@/config/statusConfig';
import { ChevronDown } from 'lucide-react';
import { UserStatus } from '@/types/chatTypes';

interface UserStatusSelectorProps {
  currentStatus: UserStatus;
  onStatusChange: (status: UserStatus) => void;
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
        className="inline-flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 w-full border border-slate-100"
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusConfig[currentStatus].color} ring-2 ${statusConfig[currentStatus].ringColor}`} />
          <span className="text-sm text-slate-700 font-medium">{statusConfig[currentStatus].label}</span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => {
                onStatusChange(status as keyof typeof statusConfig);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-slate-50 text-left transition-colors duration-200"
            >
              <div className={`w-3 h-3 rounded-full ${config.color} ring-2 ${config.ringColor}`} />
              <span className="text-sm text-slate-700">{config.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};