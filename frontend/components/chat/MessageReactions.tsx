// frontend/src/components/chat/MessageReactions.tsx
import { useState } from 'react';
import { Smile, ChevronDown, Heart, SmilePlus } from 'lucide-react';
import { MessageReaction } from '@/types/chatTypes';

const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageReactionsProps {
    reactions: MessageReaction[];
    onReact: (emoji: string) => void;
    showEmojiPicker: boolean;
    onToggleEmojiPicker: () => void;
    currentUserId: string;
}

export const MessageReactions = ({
    reactions,
    onReact,
    showEmojiPicker,
    onToggleEmojiPicker,
    currentUserId
}: MessageReactionsProps) => {
    const [showAllReactions, setShowAllReactions] = useState(false);

    // Agrupa reações por emoji
    const reactionsCount = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = { count: 0, users: [] };
        }
        acc[reaction.emoji].count += 1;
        acc[reaction.emoji].users.push(reaction.userName);
        return acc;
    }, {} as Record<string, { count: number; users: string[] }>);

    const reactionEntries = Object.entries(reactionsCount);
    const hasMoreThanTwoReactions = reactionEntries.length > 2;

    return (
        <div className="relative">
            <div className="flex gap-1 mt-1">
                {hasMoreThanTwoReactions ? (
                    // Mostra ícone de resumo quando há mais de 2 reações diferentes
                    <button
                        onClick={() => setShowAllReactions(!showAllReactions)}
                        className="px-2 py-1 rounded-full text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200"
                    >
                        <SmilePlus size={14} className="text-gray-500" />
                        <span>{reactionEntries.length}</span>
                        <ChevronDown size={12} className={`transition-transform ${showAllReactions ? 'rotate-180' : ''}`} />
                    </button>
                ) : (
                    // Mostra as reações normalmente quando há 2 ou menos
                    reactionEntries.map(([emoji, { count, users }]) => (
                        <button
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${reactions.some(r => r.userId === currentUserId && r.emoji === emoji)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                            title={users.join(', ')}
                        >
                            <span>{emoji}</span>
                            <span>{count}</span>
                        </button>
                    ))
                )}

                <button
                    onClick={onToggleEmojiPicker}
                    className="p-1 rounded-full hover:bg-gray-100"
                    title="Adicionar reação"
                >
                    <Smile size={16} className="text-gray-500" />
                </button>
            </div>

            {/* Modal de todas as reações quando há mais de 2 */}
            {hasMoreThanTwoReactions && showAllReactions && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="space-y-1">
                        {reactionEntries.map(([emoji, { count, users }]) => (
                            <div
                                key={emoji}
                                className="flex items-center justify-between gap-4 p-1 hover:bg-gray-50 rounded"
                            >
                                <div className="flex items-center gap-2">
                                    <span>{emoji}</span>
                                    <span className="text-xs text-gray-500">{count}</span>
                                </div>
                                <button
                                    onClick={() => onReact(emoji)}
                                    className={`text-xs px-2 py-1 rounded ${reactions.some(r => r.userId === currentUserId && r.emoji === emoji)
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {reactions.some(r => r.userId === currentUserId && r.emoji === emoji)
                                        ? 'Remover'
                                        : 'Reagir'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seletor de emoji */}
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