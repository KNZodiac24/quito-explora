import express from 'express';
import supabase from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

// Obtener mensajes de chat de un evento específico
router.get('/:eventoId', authMiddleware, async (req, res) => {
  try {
    const { eventoId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('mensajes_chat')
      .select('*')
      .eq('evento_id', eventoId)
      .order('fecha_envio', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Guardar mensaje de chat en un evento específico
router.post('/:eventoId', authMiddleware, async (req, res) => {
  try {
    const { eventoId } = req.params;
    const { contenido } = req.body;
    const { id: usuario_id, nombre: usuario_nombre } = req.user;

    if (!contenido || contenido.trim() === '') {
      return res.status(400).json({ error: 'El contenido del mensaje es obligatorio' });
    }

    // Verificar que el evento existe
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id')
      .eq('id', eventoId)
      .single();

    if (eventoError || !evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const { data, error } = await supabase
      .from('mensajes_chat')
      .insert([{
        evento_id: parseInt(eventoId),
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
