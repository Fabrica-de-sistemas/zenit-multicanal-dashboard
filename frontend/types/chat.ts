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