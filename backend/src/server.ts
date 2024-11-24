// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';

const app = express();

// Configuração mais permissiva do CORS para desenvolvimento
app.use(cors({
  origin: ['http://localhost:3000'], // Permitir apenas o frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.method === 'POST') {
    console.log('Body:', {
      ...req.body,
      password: req.body.password ? '[PROTEGIDO]' : undefined
    });
  }
  next();
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\nServidor rodando em http://localhost:${PORT}`);
});