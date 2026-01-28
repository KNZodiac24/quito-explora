import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function getAllEventos(req, res) {
  try {
    const { categoria, estado, sector, ordenar = 'fecha_evento' } = req.query;

    const where = {};
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;
    if (sector) where.sector = sector;

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { [ordenar]: 'asc' }
    });

    res.json(eventos);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
}

export async function searchEventos(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
    }

    const eventos = await prisma.evento.findMany({
      where: {
        OR: [
          { titulo: { contains: q, mode: 'insensitive' } },
          { descripcion: { contains: q, mode: 'insensitive' } },
          { lugar: { contains: q, mode: 'insensitive' } },
          { organizador: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { fecha_evento: 'asc' }
    });

    res.json(eventos);
  } catch (error) {
    console.error('Error buscando eventos:', error);
    res.status(500).json({ error: 'Error al buscar eventos' });
  }
}

export async function getEventoById(req, res) {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(evento);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
}

export async function createEvento(req, res) {
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

    if (!titulo || !categoria || !fecha_evento || !hora_inicio || !lugar) {
      return res.status(400).json({
        error: 'Título, categoría, fecha, hora de inicio y lugar son requeridos'
      });
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        descripcion,
        categoria,
        fecha_evento: new Date(fecha_evento),
        hora_inicio,
        hora_fin,
        lugar,
        direccion_lugar,
        sector,
        capacidad_max: capacidad_max ? parseInt(capacidad_max) : null,
        precio_entrada: precio_entrada ? parseFloat(precio_entrada) : 0,
        organizador,
        contacto_organizador,
        imagen_url,
        es_gratuito: es_gratuito || false,
        requiere_reserva: requiere_reserva || false,
        es_virtual: es_virtual || false,
        link_virtual,
        estado: estado || 'Programado',
        edad_minima: edad_minima ? parseInt(edad_minima) : null,
        accesibilidad_discapacidad: accesibilidad_discapacidad || false,
        estacionamiento_disponible: estacionamiento_disponible || false
      }
    });

    res.status(201).json(evento);
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
}

export async function updateEvento(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Procesar campos numéricos y de fecha
    if (updateData.fecha_evento) {
      updateData.fecha_evento = new Date(updateData.fecha_evento);
    }
    if (updateData.capacidad_max) {
      updateData.capacidad_max = parseInt(updateData.capacidad_max);
    }
    if (updateData.precio_entrada) {
      updateData.precio_entrada = parseFloat(updateData.precio_entrada);
    }
    if (updateData.edad_minima) {
      updateData.edad_minima = parseInt(updateData.edad_minima);
    }

    const updatedEvento = await prisma.evento.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(updatedEvento);
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
}

export async function deleteEvento(req, res) {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id) }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await prisma.evento.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
}

export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ error: 'Error al subir imagen' });
  }
}

// Endpoint interno para verificar si un evento existe
export async function checkEventoExists(req, res) {
  try {
    const { id } = req.params;

    const evento = await prisma.evento.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, titulo: true }
    });

    res.json({ exists: !!evento, evento });
  } catch (error) {
    console.error('Error verificando evento:', error);
    res.status(500).json({ exists: false, error: 'Error al verificar evento' });
  }
}
