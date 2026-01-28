import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const EVENTOS_SERVICE_URL = process.env.EVENTOS_SERVICE_URL || 'http://eventos-service:3002';

async function checkEventoExists(eventoId) {
  try {
    const response = await fetch(`${EVENTOS_SERVICE_URL}/internal/eventos/${eventoId}/exists`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Error verificando evento:', error);
    return false;
  }
}

export async function getMensajes(req, res) {
  try {
    const { eventoId } = req.params;
    const { limit = 50 } = req.query;

    const mensajes = await prisma.mensajeChat.findMany({
      where: { evento_id: parseInt(eventoId) },
      orderBy: { fecha_envio: 'asc' },
      take: parseInt(limit)
    });

    res.json(mensajes);
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
}

export async function createMensaje(req, res) {
  try {
    const { eventoId } = req.params;
    const { contenido } = req.body;
    const { id: usuario_id, nombre: usuario_nombre } = req.user;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    // Verificar que el evento existe
    const eventoExists = await checkEventoExists(eventoId);
    if (!eventoExists) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const mensaje = await prisma.mensajeChat.create({
      data: {
        evento_id: parseInt(eventoId),
        usuario_id,
        usuario_nombre,
        contenido: contenido.trim()
      }
    });

    res.status(201).json(mensaje);
  } catch (error) {
    console.error('Error creando mensaje:', error);
    res.status(500).json({ error: 'Error al crear mensaje' });
  }
}

export async function saveMensajeFromWS(eventoId, userId, userName, contenido) {
  try {
    const mensaje = await prisma.mensajeChat.create({
      data: {
        evento_id: parseInt(eventoId),
        usuario_id: userId,
        usuario_nombre: userName,
        contenido: contenido.trim()
      }
    });
    return mensaje;
  } catch (error) {
    console.error('Error guardando mensaje desde WS:', error);
    return null;
  }
}
