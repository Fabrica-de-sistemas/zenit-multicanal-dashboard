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