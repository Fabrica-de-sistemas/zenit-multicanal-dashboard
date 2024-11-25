// utils/formatters.ts
/**
 * Formata um número de telefone para o padrão brasileiro internacional
 * @param phoneNumber - Número do telefone (com ou sem @c.us)
 * @returns Número formatado (ex: +55 21 99999-9999)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove tudo que não for número
    const numbers = phoneNumber.replace(/\D/g, '');

    // Se o número já vier com @c.us, remove
    const cleanNumber = numbers.replace('@c.us', '');

    // Verifica se tem o tamanho correto (13 dígitos: 55 + DDD + número)
    if (cleanNumber.length === 13) {
        const country = cleanNumber.slice(0, 2);
        const areaCode = cleanNumber.slice(2, 4);
        const firstPart = cleanNumber.slice(4, 9);
        const secondPart = cleanNumber.slice(9);
        return `+${country} ${areaCode} ${firstPart}-${secondPart}`;
    }

    // Se tiver 12 dígitos (sem o 9 na frente)
    if (cleanNumber.length === 12) {
        const country = cleanNumber.slice(0, 2);
        const areaCode = cleanNumber.slice(2, 4);
        const firstPart = cleanNumber.slice(4, 8);
        const secondPart = cleanNumber.slice(8);
        return `+${country} ${areaCode} ${firstPart}-${secondPart}`;
    }

    // Se não conseguir formatar, retorna o número original limpo
    return cleanNumber;
};

/**
 * Formata a hora de uma mensagem
 * @param timestamp - String de data/hora
 * @returns Hora formatada (ex: 14:30)
 */
export const formatMessageTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);

        // Verifica se a data é válida
        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/^24:/, '00:'); // Corrige casos de meia-noite
    } catch (error) {
        console.error('Erro ao formatar hora:', error);
        return '';
    }
};

/**
 * Calcula e formata o tempo decorrido desde uma data/hora
 * @param timestamp - String de data/hora
 * @returns Tempo decorrido formatado (ex: "há 5 minutos")
 */
export const formatElapsedTime = (timestamp: string): string => {
    try {
        const messageDate = new Date(timestamp);
        const currentDate = new Date();

        if (isNaN(messageDate.getTime())) {
            return '';
        }

        // Calcula a diferença em minutos
        const diffInMinutes = Math.floor((currentDate.getTime() - messageDate.getTime()) / (1000 * 60));

        // Converte para horas se necessário
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;

        // Formata a saída
        if (hours > 0) {
            return `${hours}h${minutes}min atrás`;
        } else if (minutes > 0) {
            return `${minutes}min atrás`;
        } else {
            return 'menos de 1min atrás';
        }
    } catch (error) {
        console.error('Erro ao calcular tempo decorrido:', error);
        return '';
    }
};

export const formatFullDateTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data e hora:', error);
        return '';
    }
};