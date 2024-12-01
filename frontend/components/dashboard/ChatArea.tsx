// components/dashboard/ChatArea.tsx
import React, { useState } from 'react';
import { Send, Instagram, Twitter, Facebook, MessageCircle, MessageSquare } from 'lucide-react';
import { formatPhoneNumber, formatMessageTime, formatElapsedTime, formatFullDateTime } from '@/utils/formatters';
import { Ticket } from '@/types/chat';

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

    const handleSend = () => {
        if (!newMessage.trim() || !selectedMessage) return;
        onSendMessage(newMessage.trim());
        setNewMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!selectedMessage) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecione uma conversa para começar
            </div>
        );
    }

    // Pega a primeira mensagem para informações do cliente
    const firstMessage = selectedMessage.messages[0];

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-medium">
                            {firstMessage?.sender.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">
                                {firstMessage?.platform === 'whatsapp'
                                    ? formatPhoneNumber(firstMessage.sender.username)
                                    : firstMessage?.sender.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-gray-500">
                                {firstMessage && getChannelIcon(firstMessage.platform)}
                                <span className="text-sm capitalize">
                                    {firstMessage?.platform}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onResolveTicket}
                        disabled={selectedMessage.status === 'resolved'}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${selectedMessage.status === 'resolved'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {selectedMessage.status === 'resolved' ? 'Resolvido' : 'Resolver'}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedMessage?.messages.map((message, index) => (
                    <div
                        key={`${message.id}-${index}`}
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
                                    ? 'bg-emerald-100 text-gray-800'
                                    : 'bg-white'
                                }`}>
                                <div className="text-xs mb-1 font-medium">
                                    {message.sender.isOperator
                                        ? 'Atendente'
                                        : message.platform === 'whatsapp'
                                            ? formatPhoneNumber(message.sender.username)
                                            : message.sender.username}
                                </div>
                                <p className="whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 mx-2">
                                {formatFullDateTime(message.timestamp)}
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
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={selectedMessage.status === 'resolved'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={selectedMessage.status === 'resolved'}
                        className={`px-6 py-3 rounded-xl flex items-center space-x-2 ${selectedMessage.status === 'resolved'
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