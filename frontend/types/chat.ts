// frontend/types/chat.ts
export interface SocialMessage {
    id: string;
    content: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'site';
    sender: {
        name: string;
        username: string;
        isOperator?: boolean;
    };
    timestamp: string;
}

export interface Ticket {
    id: string;
    status: 'open' | 'resolved';
    messages: SocialMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface CompanyMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  replyTo?: {
    id: string;
    content: string;
    userName: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  mentions?: string[];
}

export interface PrivateChat {
  id: string;
  users: {
    id: string;
    name: string;
  }[];
  lastMessage?: {
    content: string;
    timestamp: string;
  };
}