// frontend/src/components/chat/MessageReactions.tsx
import { useState, useRef, useEffect } from 'react';
import { Smile, SmilePlus, ChevronDown } from 'lucide-react';
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
    const containerRef = useRef<HTMLDivElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const allReactionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Fecha o emoji picker
            if (showEmojiPicker &&
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                onToggleEmojiPicker();
            }

            // Fecha o menu de todas as reações
            if (showAllReactions &&
                allReactionsRef.current &&
                !allReactionsRef.current.contains(event.target as Node)
            ) {
                setShowAllReactions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker, onToggleEmojiPicker, showAllReactions]);

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
    const hasMoreThanThreeReactions = reactionEntries.length > 3;

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex gap-1 mt-1">
                {hasMoreThanThreeReactions ? (
                    <>
                        {/* Mostra as 3 primeiras reações */}
                        {reactionEntries.slice(0, 3).map(([emoji, { count, users }]) => (
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
                        ))}
                        {/* Botão para mostrar reações restantes */}
                        <button
                            onClick={() => setShowAllReactions(!showAllReactions)}
                            className="px-2 py-1 rounded-full text-xs flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200"
                            title="Ver todas as reações"
                        >
                            <SmilePlus size={14} className="text-gray-500" />
                            <span>+{reactionEntries.length - 3}</span>
                        </button>
                    </>
                ) : (
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

                {/* O botão de Smile só aparece se o usuário não tiver reagido ainda */}
                {!reactions.some(r => r.userId === currentUserId) && (
                    <button
                        onClick={onToggleEmojiPicker}
                        className="p-1 rounded-full hover:bg-gray-100"
                        title="Adicionar reação"
                    >
                        <Smile size={16} className="text-gray-500" />
                    </button>
                )}
            </div>

            {/* Seletor de emoji com posicionamento ajustado */}
            {showEmojiPicker && (
                <div
                    ref={pickerRef}
                    className="absolute z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 flex gap-1"
                    style={{
                        bottom: '100%',
                        left: '0',
                        marginBottom: '0.5rem',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
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
                </div>
            )}

            {/* Modal de todas as reações com posicionamento ajustado */}
            {hasMoreThanThreeReactions && showAllReactions && (
                <div
                    ref={allReactionsRef}
                    className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200"
                    style={{
                        bottom: '100%',
                        left: '0',
                        marginBottom: '0.5rem',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    <div className="p-2 space-y-1">
                        {reactionEntries.map(([emoji, { count, users }]) => (
                            <div
                                key={emoji}
                                className="flex items-center justify-between gap-4 p-1 hover:bg-gray-50 rounded"
                            >
                                <button
                                    onClick={() => onReact(emoji)}
                                    className={`flex items-center gap-2 px-2 py-1 rounded w-full ${reactions.some(r => r.userId === currentUserId && r.emoji === emoji)
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <span>{emoji}</span>
                                    <span className="text-xs text-gray-500">{count}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};