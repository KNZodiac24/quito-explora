import express from 'express';
import supabase from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
const router = express.Router();

// Obtener todos los eventos (usuarios autenticados)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { categoria, estado, sector, ordenar = 'fecha_evento' } = req.query;
    
    let query = supabase
      .from('eventos')
      .select('*')
      .order(ordenar, { ascending: true });

    // Aplicar filtros si existen
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }
    if (sector) {
      query = query.eq('sector', sector);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// Buscar eventos
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .or(`titulo.ilike.%${q}%,descripcion.ilike.%${q}%,lugar.ilike.%${q}%,organizador.ilike.%${q}%`)
      .order('fecha_evento', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error en búsqueda de eventos' });
  }
});

// Obtener un evento por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

// Crear un nuevo evento (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      categoria,
      fecha_evento,
      hora_inicio,
      hora_fin,
      lugar,
      direccion_lugar,
      sector,
      capacidad_max,
      precio_entrada,
      organizador,
      contacto_organizador,
      imagen_url,
      es_gratuito,
      requiere_reserva,
      es_virtual,
      link_virtual,
      estado,
      edad_minima,
      accesibilidad_discapacidad,
      estacionamiento_disponible,
      tags
    } = req.body;

    // Validaciones
    if (!titulo || !categoria || !fecha_evento || !hora_inicio || !lugar) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const { data, error } = await supabase
      .from('eventos')
      .insert([{
        titulo,
        descripcion,
        categoria,
        fecha_evento,
        hora_inicio,
        hora_fin,
        lugar,
        direccion_lugar,
        sector,
        capacidad_max,
        precio_entrada: precio_entrada || 0,
        organizador,
        contacto_organizador,
        imagen_url,
        es_gratuito: es_gratuito || false,
        requiere_reserva: requiere_reserva || false,
        es_virtual: es_virtual || false,
        link_virtual,
        estado: estado || 'Programado',
        edad_minima,
        accesibilidad_discapacidad: accesibilidad_discapacidad || false,
        estacionamiento_disponible: estacionamiento_disponible || false,
        tags
      }])
      .select();

    if (error) throw error;

    res.status(201).json({ mensaje: 'Evento creado exitosamente', evento: data[0] });
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// Actualizar un evento (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      categoria,
      fecha_evento,
      hora_inicio,
      hora_fin,
      lugar,
      direccion_lugar,
      sector,
      capacidad_max,
      precio_entrada,
      organizador,
      contacto_organizador,
      imagen_url,
      es_gratuito,
      requiere_reserva,
      es_virtual,
      link_virtual,
      estado,
      edad_minima,
      accesibilidad_discapacidad,
      estacionamiento_disponible,
      tags
    } = req.body;

    const { data, error } = await supabase
      .from('eventos')
      .update({
        titulo,
        descripcion,
        categoria,
        fecha_evento,
        hora_inicio,
        hora_fin,
        lugar,
        direccion_lugar,
        sector,
        capacidad_max,
        precio_entrada,
        organizador,
        contacto_organizador,
        imagen_url,
        es_gratuito,
        requiere_reserva,
        es_virtual,
        link_virtual,
        estado,
        edad_minima,
        accesibilidad_discapacidad,
        estacionamiento_disponible,
        tags
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ mensaje: 'Evento actualizado exitosamente', evento: data[0] });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// Eliminar un evento (solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ mensaje: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

export default router;
