// frontend/src/types/chatTypes.ts

import { statusConfig } from "@/config/statusConfig";

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
    reactions?: Reaction[];
    mentions?: string[];
}

export interface Message {
    id: string;
    content: string;
    userId: string;
    userName: string;
    platform: string;
    sender: {
        name: string;
        username: string;
        isOperator?: boolean;
    };
    timestamp: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

export interface Reaction {
    emoji: string;
    users: string[];
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

export interface OnlineUser {
    id: string;
    name: string;
    role: string;
    sector: string;
    status: keyof typeof statusConfig;
    isOnline: boolean;
    lastSeen: string;
    socketId?: string;
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
}

export type UserStatus = 'available' | 'away' | 'meeting';

export type SortType = 'az' | 'za' | 'sector';