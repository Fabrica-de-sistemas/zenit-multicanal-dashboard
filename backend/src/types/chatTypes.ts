// backend/src/types/chatTypes.ts
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
  toUserId?: string;
}