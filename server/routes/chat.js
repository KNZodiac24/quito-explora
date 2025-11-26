import express from 'express';
import supabase from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

// Obtener mensajes de chat
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('mensajes_chat')
      .select('*')
      .order('fecha_envio', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Guardar mensaje de chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contenido } = req.body;
    const { id: usuario_id, nombre: usuario_nombre } = req.user;

    if (!contenido || contenido.trim() === '') {
      return res.status(400).json({ error: 'El contenido del mensaje es obligatorio' });
    }

    const { data, error } = await supabase
      .from('mensajes_chat')
      .insert([{
        usuario_id,
        usuario_nombre,
        contenido: contenido.trim()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al guardar mensaje:', error);
    res.status(500).json({ error: 'Error al guardar mensaje' });
  }
});

export default router;
