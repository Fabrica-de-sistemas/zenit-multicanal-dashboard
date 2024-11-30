// frontend/src/components/chat/ChatHeader.tsx
import { User } from 'lucide-react';

export const ChatHeader = () => {
  return (
    <div className="h-16 px-4 border-b flex items-center justify-between bg-white">
      <div className="flex items-center space-x-2">
        <User className="w-6 h-6 text-gray-500" />
        <h2 className="font-semibold text-gray-800">Chat Interno</h2>
      </div>
      <div className="text-sm text-gray-500">
        Online: 3 usuários
      </div>
    </div>
  );
};