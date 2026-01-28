import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  validateToken,
  getUserById
} from '../controllers/authController.js';

const router = Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Rutas internas (para comunicación entre microservicios)
router.get('/internal/validate', validateToken);
router.get('/internal/users/:id', getUserById);

export default router;
