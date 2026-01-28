import { Router } from 'express';
import { getMensajes, createMensaje } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Obtener mensajes de un evento
router.get('/:eventoId', authMiddleware, getMensajes);

// Crear un nuevo mensaje
router.post('/:eventoId', authMiddleware, createMensaje);

export default router;
