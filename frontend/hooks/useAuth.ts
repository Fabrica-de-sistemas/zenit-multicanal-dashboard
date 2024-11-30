// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  sector: string;
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Pega as informações do usuário do localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login';
  };

  return { user, logout };
}