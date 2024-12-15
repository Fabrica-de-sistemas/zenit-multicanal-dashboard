// backend/src/types/chatTypes.ts
export interface CompanyMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
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

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  reactions: MessageReaction[];
}