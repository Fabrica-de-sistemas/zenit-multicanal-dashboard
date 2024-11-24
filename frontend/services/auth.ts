import axios from 'axios';
import { RegisterData, LoginData, AuthResponse } from '@/types/auth';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  async register(data: RegisterData) {
    try {
      console.log('Enviando requisição de registro:', {
        ...data,
        password: '[PROTEGIDO]'
      });

      const response = await api.post('/auth/register', data);
      console.log('Resposta da API:', response.data);

      return response.data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'Erro ao registrar';
        console.error('Mensagem de erro:', message);
        throw new Error(message);
      }
      throw error;
    }
  },

  async login(data: LoginData) {
    try {
      console.log('Enviando dados de login:', { email: data.email });
      const response = await api.post<AuthResponse>('/auth/login', data);
      console.log('Resposta do login:', response.data);
      
      // Salvar o token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Erro ao fazer login');
      }
      throw error;
    }
  }
};