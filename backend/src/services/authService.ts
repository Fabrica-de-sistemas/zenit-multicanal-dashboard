// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, execute, User } from '../lib/db';
import { RegisterData, LoginData, AuthResponse } from '../types/auth';
import { authQueries } from '../database/queries/authQueries';

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Verifica usuário existente
      const existingUsers = await query<User>(
        authQueries.findByEmailOrRegistration,
        [data.email, data.registration]
      );

      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        if (user.email === data.email) {
          throw new Error('Email já está em uso');
        }
        if (user.registration === data.registration) {
          throw new Error('Matrícula já está em uso');
        }
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Cria novo usuário
      await execute(
        authQueries.createUser,
        [data.fullName, data.email, data.registration, hashedPassword, 'OPERATOR']
      );

      // Busca o usuário criado
      const [newUser] = await query<User>(
        authQueries.findByEmail,
        [data.email]
      );

      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          role: newUser.role 
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          role: newUser.role
        },
        token
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const users = await query<User>(
        authQueries.findByEmail,
        [data.email]
      );

      if (users.length === 0) {
        throw new Error('Email ou senha incorretos');
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(data.password, user.password);

      if (!validPassword) {
        throw new Error('Email ou senha incorretos');
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async getProfile(userId: string) {
    try {
      const users = await query<User>(
        authQueries.findById,
        [userId]
      );

      if (users.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      return users[0];
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();