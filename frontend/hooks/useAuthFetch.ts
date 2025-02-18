// frontend/hooks/useAuthFetch.ts
export function useAuthFetch() {
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const authFetch = async (url: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Não autenticado');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Token inválido');
        }

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return response;
    };

    return { authFetch, getAuthHeaders };
}