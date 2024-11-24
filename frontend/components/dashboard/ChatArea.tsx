// frontend/components/dashboard/ChatArea.tsx
'use client';

import React, { useState } from 'react';
import { Send, Instagram, Twitter, Facebook, MessageSquare, MessageCircle } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/formatters';
import { useSocket } from '@/hooks/useSocket';

interface SocialMessage {
    id: string;
    content: string;
    platform: 'facebook' | 'instagram' | 'twitter' | 'whatsapp' | 'site';
    sender: {
        name: string;
        username: string;
        isOperator?: boolean;
    };
    timestamp: string;
    status?: 'Resolvido' | 'Em Atendimento' | 'Novo';
}

interface Ticket {
    id: string;
    status: 'open' | 'resolved';
    messages: SocialMessage[];
    createdAt: string;
    updatedAt: string;
}

interface ChatAreaProps {
    selectedMessage: Ticket | null;
    onSendMessage: (message: string) => void;
    onResolveTicket: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    selectedMessage,
    onSendMessage,
    onResolveTicket
}) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSend = () => {
        if (!newMessage.trim() || !selectedMessage) return;
        onSendMessage(newMessage.trim());
        setNewMessage('');
    };

    const getChannelIcon = (platform: string) => {
        switch (platform) {
            case 'instagram':
                return <Instagram size={14} className="text-pink-500" />;
            case 'twitter':
                return <Twitter size={14} className="text-blue-400" />;
            case 'facebook':
                return <Facebook size={14} className="text-blue-600" />;
            case 'whatsapp':
                return <MessageCircle size={14} className="text-green-500" />;
            case 'site':
                return <MessageSquare size={14} className="text-purple-500" />;
            default:
                return null;
        }
    };

    const getStatusStyle = (status: 'open' | 'resolved' | undefined) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'open':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getPlatformName = (platform: SocialMessage['platform']) => {
        switch (platform) {
            case 'site':
                return 'Fale Conosco';
            default:
                return platform.charAt(0).toUpperCase() + platform.slice(1);
        }
    };

    if (!selectedMessage) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecione uma conversa para começar
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-medium">
                            {selectedMessage.messages[0]?.sender.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">
                                {selectedMessage.messages[0]?.sender.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-gray-500">
                                {getChannelIcon(selectedMessage.messages[0]?.platform)}
                                <span className="text-sm">
                                    {getPlatformName(selectedMessage.messages[0]?.platform)}: {selectedMessage.id}
                                </span>
                                <span className="mx-2">•</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(selectedMessage.status)}`}>
                                    {selectedMessage.status === 'resolved' ? 'Resolvido' : 'Em Atendimento'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Transferir
                        </button>
                        <button
                            onClick={onResolveTicket}
                            disabled={selectedMessage?.status === 'resolved'}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${selectedMessage?.status === 'resolved'
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                }`}
                        >
                            {selectedMessage?.status === 'resolved' ? 'Resolvido' : 'Resolver'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedMessage?.messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${message.sender.isOperator ? 'justify-end' : ''
                            }`}
                    >
                        {!message.sender.isOperator && (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-sm font-medium">
                                {message.sender.name.charAt(0)}
                            </div>
                        )}
                        <div className={`flex flex-col ${message.sender.isOperator ? 'items-end' : ''}`}>
                            <div className={`p-4 rounded-2xl shadow-sm max-w-md ${message.sender.isOperator
                                ? 'bg-blue-500 text-white'
                                : 'bg-white'
                                }`}>
                                {/* Nome/Número do remetente */}
                                <div className="text-xs mb-1 font-medium">
                                    {message.sender.isOperator
                                        ? 'Atendente'
                                        : message.platform === 'whatsapp'
                                            ? formatPhoneNumber(message.sender.username)
                                            : message.sender.username
                                    }
                                </div>
                                <p>{message.content}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 mx-2">
                                {message.timestamp}
                            </span>
                        </div>
                        {message.sender.isOperator}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl"
                        disabled={selectedMessage?.status === 'resolved'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={selectedMessage?.status === 'resolved'}
                        className={`px-6 py-3 rounded-xl flex items-center space-x-2 ${selectedMessage?.status === 'resolved'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                    >
                        <span>Enviar</span>
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};