// backend/src/routes/uploadRoutes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = Router();

// Configura o multer para salvar arquivos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Usando o tipo Request e Response do Express para garantir a tipagem correta
// O tipo Promise<void> significa que a função é assíncrona, mas não retorna nenhum valor
router.post('/upload', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return; // Não há mais nada para fazer após responder
    }

    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    
    // Responde com JSON
    res.json({
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload do arquivo' });
  }
});

export default router;
