// frontend/src/components/chat/PrivateChat.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Send, Minus, X, Paperclip } from 'lucide-react';

interface PrivateMessage {
    id: string;
    content: string;
    userId: string;
    userName: string;
    timestamp: string;
    type: 'private';
    toUserId: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

interface PrivateChatProps {
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    onClose: () => void;
    hasNewMessage?: boolean;
    onMinimize?: () => void;
    isMinimized?: boolean;
}

export const PrivateChat: React.FC<PrivateChatProps> = ({
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    onClose,
    hasNewMessage = false,
    onMinimize,
    isMinimized = false
}) => {
    const [messages, setMessages] = useState<PrivateMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!socket) return;

        socket.emit('getPrivateChatHistory', {
            fromUserId,
            toUserId
        });

        const handlePrivateChatHistory = (data: { messages: PrivateMessage[] }) => {
            if (data.messages) {
                setMessages(data.messages);
                scrollToBottom();
            }
        };

        const handleNewPrivateMessage = (message: PrivateMessage) => {
            if (
                (message.userId === fromUserId && message.toUserId === toUserId) ||
                (message.userId === toUserId && message.toUserId === fromUserId)
            ) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        socket.on('privateChatHistory', handlePrivateChatHistory);
        socket.on('newPrivateMessage', handleNewPrivateMessage);

        return () => {
            socket.off('privateChatHistory', handlePrivateChatHistory);
            socket.off('newPrivateMessage', handleNewPrivateMessage);
        };
    }, [socket, fromUserId, toUserId]);

    const handleSendMessage = () => {
        if (!socket || !newMessage.trim()) return;

        const messageData = {
            content: newMessage,
            userId: fromUserId,
            userName: fromUserName,
            toUserId: toUserId,
            timestamp: new Date().toISOString(),
            type: 'private' as const
        };

        socket.emit('sendPrivateMessage', messageData);
        setNewMessage('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socket) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            const messageData = {
                content: `Arquivo: ${file.name}`,
                userId: fromUserId,
                userName: fromUserName,
                toUserId: toUserId,
                timestamp: new Date().toISOString(),
                type: 'private' as const,
                fileUrl: data.fileUrl,
                fileName: file.name,
                fileType: file.type
            };

            socket.emit('sendPrivateMessage', messageData);
        } catch (error) {
            console.error('Erro ao enviar arquivo:', error);
            alert('Erro ao enviar arquivo. Tente novamente.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (isMinimized) {
        return (
            <div
                className={`fixed bottom-0 right-4 w-72 bg-white rounded-t-lg shadow-xl border border-gray-200 cursor-pointer 
                   ${hasNewMessage ? 'animate-bounce' : ''}`}
                onClick={onMinimize}
            >
                <div className="p-3 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            {toUserName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">
                            {toUserName}
                            {hasNewMessage && <span className="ml-2 text-red-500">•</span>}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 right-4 w-80 bg-white rounded-t-lg shadow-xl flex flex-col border border-gray-200 h-96 z-50">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {toUserName.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-800">
                        {toUserName}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onMinimize}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <Minus size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.userId === fromUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${message.userId === fromUserId
                                    ? 'bg-emerald-100 text-gray-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {message.fileUrl ? (
                                <div className="mb-1">
                                    {message.fileType?.startsWith('image/') ? (
                                        <img
                                            src={message.fileUrl}
                                            alt={message.fileName}
                                            className="max-w-full rounded-lg mb-2"
                                        />
                                    ) : (
                                        <a
                                            href={message.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center space-x-2 hover:underline text-current"
                                        >
                                            <Paperclip size={16} />
                                            <span>{message.fileName}</span>
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                    {message.content}
                                </p>
                            )}
                            <span className="text-xs opacity-75 mt-1 block">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                        title="Anexar arquivo"
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-emerald-500 text-gray-600 rounded-lg"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
