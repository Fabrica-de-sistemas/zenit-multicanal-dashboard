// frontend/src/components/chat/MessageReactions.tsx
'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { MessageReaction } from '@/types/chatTypes';

const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageReactionsProps {
    reactions: MessageReaction[];
    onReact: (emoji: string) => void;
    showEmojiPicker: boolean;
    onToggleEmojiPicker: () => void;
    currentUserId: string;
}

type ReactionGroup = {
    count: number;
    users: string[];
};

export const MessageReactions = ({
    reactions,
    onReact,
    showEmojiPicker,
    onToggleEmojiPicker,
    currentUserId
}: MessageReactionsProps) => {
    // Agrupa reações por emoji
    const reactionsCount = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = { count: 0, users: [] };
        }
        acc[reaction.emoji].count += 1;
        acc[reaction.emoji].users.push(reaction.userName);
        return acc;
    }, {} as Record<string, ReactionGroup>);

    return (
        <div className="relative">
            <div className="flex gap-1 mt-1">
                {Object.entries(reactionsCount).map(([emoji, { count, users }]) => (
                    <button
                        key={emoji}
                        onClick={() => onReact(emoji)}
                        className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                            reactions.some(r => r.userId === currentUserId && r.emoji === emoji)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        title={users.join(', ')}
                    >
                        <span>{emoji}</span>
                        <span>{count}</span>
                    </button>
                ))}
                
                <button
                    onClick={onToggleEmojiPicker}
                    className="p-1 rounded-full hover:bg-gray-100"
                    title="Adicionar reação"
                >
                    <Smile size={16} className="text-gray-500" />
                </button>
            </div>

            {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 flex gap-1">
                    {availableEmojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => {
                                onReact(emoji);
                                onToggleEmojiPicker();
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg text-lg"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};