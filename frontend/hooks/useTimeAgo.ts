// hooks/useTimeAgo.ts
import { useState, useEffect } from 'react';

export function useTimeAgo(timestamp: string): string {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    function updateTimeAgo() {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `há ${days}d`;
      } else if (hours > 0) {
        return `há ${hours}h`;
      } else if (minutes > 0) {
        return `há ${minutes}min`;
      } else if (seconds > 30) {
        return `há ${seconds}s`;
      } else {
        return 'agora';
      }
    }

    // Atualiza inicialmente
    setTimeAgo(updateTimeAgo());

    // Atualiza a cada 30 segundos
    const interval = setInterval(() => {
      setTimeAgo(updateTimeAgo());
    }, 30000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeAgo;
}