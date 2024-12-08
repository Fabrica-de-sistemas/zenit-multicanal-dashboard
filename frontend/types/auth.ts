//frontend/types/auth.ts
export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  registration: string;
  password: string;
  sector?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  sector: string; 
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialMessage {
  id: string;
  content: string;
  platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'site';
  sender: {
    name: string;
    username: string;
  };
  timestamp: string;
}