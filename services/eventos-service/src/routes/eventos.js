import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllEventos,
  searchEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
  uploadImage,
  checkEventoExists
} from '../controllers/eventosController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `evento-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Rutas públicas (requieren autenticación)
router.get('/', authMiddleware, getAllEventos);
router.get('/search', authMiddleware, searchEventos);
router.get('/:id', authMiddleware, getEventoById);

// Rutas de administrador
router.post('/', authMiddleware, adminMiddleware, createEvento);
router.put('/:id', authMiddleware, adminMiddleware, updateEvento);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvento);
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('imagen'), uploadImage);

// Rutas internas (para comunicación entre microservicios)
router.get('/internal/eventos/:id/exists', checkEventoExists);

export default router;
