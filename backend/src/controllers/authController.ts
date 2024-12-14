// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Correção aqui
import { query, execute } from '../lib/db';
import { authQueries } from '../database/queries/authQueries';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      console.log('\n=== INÍCIO DO PROCESSO DE REGISTRO ===');
      console.log('Dados recebidos:', {
        ...req.body,
        password: '[PROTEGIDO]'
      });

      const { fullName, email, registration, password, sector, role } = req.body;

      // Validação dos dados
      if (!fullName || !email || !registration || !password || !sector || !role) {
        console.log('Erro: Dados inválidos');
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios'
        });
      }

      console.log('Verificando usuário existente...');
      const existingUsers = await query(
        authQueries.findByEmailOrRegistration,
        [email, registration]
      );

      if (existingUsers.length > 0) {
        const user = existingUsers[0];
        if (user.email === email) {
          console.log('Erro: Email já está em uso');
          return res.status(400).json({ error: 'Email já está em uso' });
        }
        if (user.registration === registration) {
          console.log('Erro: Matrícula já está em uso');
          return res.status(400).json({ error: 'Matrícula já está em uso' });
        }
      }

      console.log('Criando hash da senha...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hash criado com sucesso');

      try {
        console.log('Tentando criar usuário no banco...');
        const result = await execute(
          `
         INSERT INTO users (full_name, email, registration, password, role, sector)
         VALUES (?, ?, ?, ?, ?, ?)
         `,
          [fullName, email, registration, hashedPassword, role, sector]
        );

        const userId = result.insertId;
        console.log('Usuário criado com sucesso. ID:', userId);

        console.log('Buscando usuário atualizado...');
        const users = await query(authQueries.findById, [userId]);

        if (users.length === 0) {
          throw new Error('Erro ao recuperar usuário criado');
        }

        const newUser = users[0];

        const token = jwt.sign(
          {
            userId: newUser.id,
            email: newUser.email
          },
          process.env.JWT_SECRET || 'fallback_secret'
          // Removido o expiresIn para o token não expirar
        );

        console.log('Token JWT gerado com sucesso');
        console.log('=== FIM DO PROCESSO DE REGISTRO ===\n');

        return res.status(201).json({
          message: 'Usuário criado com sucesso',
          user: {
            id: newUser.id,
            fullName: newUser.full_name,
            email: newUser.email,
            role: newUser.role,
            sector: newUser.sector
          },
          token
        });

      } catch (dbError) {
        console.error('Erro detalhado:', dbError);
        return res.status(500).json({
          error: 'Erro ao salvar usuário',
          details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
        });
      }

    } catch (error) {
      console.error('Erro no processo de registro:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      console.log('\n=== INÍCIO DO PROCESSO DE LOGIN ===');
      console.log('Dados recebidos:', {
        email: req.body.email,
        password: '[PROTEGIDO]'
      });

      const { email, password } = req.body;

      if (!email || !password) {
        console.log('Erro: Email ou senha não fornecidos');
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      console.log('Buscando usuário...');
      const users = await query(
        authQueries.findByEmail,
        [email]
      );

      if (users.length === 0) {
        console.log('Erro: Usuário não encontrado');
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const user = users[0];

      console.log('Verificando senha...');
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        console.log('Erro: Senha inválida');
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      console.log('Gerando token JWT...');
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret'
      );

      console.log('Login realizado com sucesso');
      console.log('=== FIM DO PROCESSO DE LOGIN ===\n');

      return res.status(200).json({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          sector: user.sector
        },
        token
      });
    } catch (error) {
      console.error('Erro no processo de login:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      console.log('\n=== INÍCIO DA BUSCA DE PERFIL ===');
      const userId = req.user?.userId;

      if (!userId) {
        console.log('Erro: UserId não fornecido');
        return res.status(401).json({ error: 'Não autorizado' });
      }

      console.log('Buscando usuário pelo ID:', userId);
      const users = await query(
        authQueries.findById,
        [userId]
      );

      if (users.length === 0) {
        console.log('Erro: Usuário não encontrado');
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = users[0];
      console.log('Perfil recuperado com sucesso');
      console.log('=== FIM DA BUSCA DE PERFIL ===\n');

      return res.json({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        sector: user.sector,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  },

  async updateSector(req: AuthRequest, res: Response) {
    try {
      console.log('\n=== INÍCIO DA ATUALIZAÇÃO DE SETOR ===');
      const userId = req.user?.userId;
      const { sector } = req.body;

      console.log('Dados recebidos:', {
        userId,
        sector
      });

      if (!userId || !sector) {
        console.log('Erro: Dados inválidos');
        return res.status(400).json({ error: 'Setor é obrigatório' });
      }

      try {
        console.log('Tentando atualizar setor do usuário...');
        await execute(authQueries.updateUserSector, [sector, userId]);

        console.log('Buscando usuário atualizado...');
        const users = await query(authQueries.findById, [userId]);

        if (users.length === 0) {
          console.log('Erro: Usuário não encontrado');
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = users[0];
        console.log('Setor atualizado com sucesso');
        console.log('=== FIM DA ATUALIZAÇÃO DE SETOR ===\n');

        return res.json({
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          sector: user.sector
        });

      } catch (dbError) {
        console.error('Erro detalhado:', dbError);
        return res.status(500).json({
          error: 'Erro ao atualizar setor',
          details: dbError instanceof Error ? dbError.message : 'Erro desconhecido'
        });
      }

    } catch (error) {
      console.error('Erro ao atualizar setor:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
};