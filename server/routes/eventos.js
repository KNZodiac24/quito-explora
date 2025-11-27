import express from 'express';
import multer from 'multer';
import path from 'path';
import supabase, { supabaseAdmin } from '../config/database.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Configurar multer para procesar archivos en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Endpoint para subir imagen a Supabase Storage
router.post('/upload-image', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    console.log('Intentando subir archivo:', req.file.originalname);
    console.log('Tamaño:', req.file.size, 'bytes');
    console.log('Tipo MIME:', req.file.mimetype);

    // Generar nombre único para el archivo
    const fileExt = path.extname(req.file.originalname);
    const fileName = `evento-${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    
    console.log('Nombre del archivo en storage:', fileName);
    
    // Subir a Supabase Storage usando cliente admin para bypass RLS
    const { data, error } = await supabaseAdmin.storage
      .from('eventos-imagenes')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error detallado de Supabase Storage:', error);
      
      // Si el bucket no existe, intentar crearlo o dar instrucciones
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'El bucket "eventos-imagenes" no existe en Supabase Storage. Por favor créalo en el dashboard de Supabase.',
          details: error.message 
        });
      }
      
      return res.status(500).json({ 
        error: 'Error al subir imagen a Supabase Storage',
        details: error.message 
      });
    }

    console.log('Imagen subida exitosamente:', data);

    // Obtener la URL pública de la imagen
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('eventos-imagenes')
      .getPublicUrl(fileName);

    console.log('URL pública generada:', publicUrlData.publicUrl);

    res.json({ 
      message: 'Imagen subida exitosamente',
      url: publicUrlData.publicUrl
    });
  } catch (error) {
    console.error('Error general al subir imagen:', error);
    res.status(500).json({ 
      error: 'Error al subir imagen',
      details: error.message 
    });
  }
});

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
      estacionamiento_disponible
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
        estacionamiento_disponible: estacionamiento_disponible || false
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
      estacionamiento_disponible
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
        estacionamiento_disponible
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
