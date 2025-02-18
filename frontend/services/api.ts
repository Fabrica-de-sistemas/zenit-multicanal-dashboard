// frontend/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
});

export const sendMessage = async (platform: string, recipientId: string, message: string) => {
  try {
    const response = await api.post('/messages/send', {
      platform,
      recipientId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
};

export default api;