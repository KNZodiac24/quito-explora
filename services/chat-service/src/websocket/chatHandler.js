import { WebSocketServer } from 'ws';
import { validateToken } from '../middleware/auth.js';
import { saveMensajeFromWS } from '../controllers/chatController.js';

// Map para almacenar clientes conectados: Map<WebSocket, { userId, userName, eventoId }>
const clients = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    console.log('Nueva conexión WebSocket');

    // Extraer token de la URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const eventoId = url.searchParams.get('eventoId');

    if (!token || !eventoId) {
      ws.close(4001, 'Token y eventoId son requeridos');
      return;
    }

    // Validar token
    const authResult = await validateToken(token);
    if (!authResult.valid) {
      ws.close(4002, 'Token inválido');
      return;
    }

    const user = authResult.user;

    // Registrar cliente
    clients.set(ws, {
      userId: user.id,
      userName: user.nombre,
      eventoId: parseInt(eventoId)
    });

    console.log(`Usuario ${user.nombre} conectado al evento ${eventoId}`);

    // Notificar a otros usuarios del mismo evento
    broadcastToEvento(eventoId, {
      type: 'user_joined',
      user: { id: user.id, nombre: user.nombre },
      timestamp: new Date().toISOString()
    }, ws);

    // Manejar mensajes
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'chat_message') {
          const clientData = clients.get(ws);
          if (!clientData) return;

          // Guardar mensaje en la base de datos
          const savedMessage = await saveMensajeFromWS(
            clientData.eventoId,
            clientData.userId,
            clientData.userName,
            message.contenido
          );

          if (savedMessage) {
            // Broadcast del mensaje a todos los usuarios del evento
            broadcastToEvento(clientData.eventoId, {
              type: 'chat_message',
              mensaje: {
                id: savedMessage.id,
                evento_id: savedMessage.evento_id,
                usuario_id: savedMessage.usuario_id,
                usuario_nombre: savedMessage.usuario_nombre,
                contenido: savedMessage.contenido,
                fecha_envio: savedMessage.fecha_envio
              }
            });
          }
        }
      } catch (error) {
        console.error('Error procesando mensaje WebSocket:', error);
      }
    });

    // Manejar desconexión
    ws.on('close', () => {
      const clientData = clients.get(ws);
      if (clientData) {
        console.log(`Usuario ${clientData.userName} desconectado del evento ${clientData.eventoId}`);

        // Notificar a otros usuarios
        broadcastToEvento(clientData.eventoId, {
          type: 'user_left',
          user: { id: clientData.userId, nombre: clientData.userName },
          timestamp: new Date().toISOString()
        }, ws);

        clients.delete(ws);
      }
    });

    // Manejar errores
    ws.on('error', (error) => {
      console.error('Error WebSocket:', error);
      clients.delete(ws);
    });

    // Enviar confirmación de conexión
    ws.send(JSON.stringify({
      type: 'connected',
      user: { id: user.id, nombre: user.nombre },
      eventoId: parseInt(eventoId)
    }));
  });

  return wss;
}

function broadcastToEvento(eventoId, message, excludeWs = null) {
  const messageStr = JSON.stringify(message);

  clients.forEach((clientData, ws) => {
    if (clientData.eventoId === parseInt(eventoId) && ws !== excludeWs && ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

export function getConnectedUsersForEvento(eventoId) {
  const users = [];
  clients.forEach((clientData) => {
    if (clientData.eventoId === parseInt(eventoId)) {
      users.push({
        userId: clientData.userId,
        userName: clientData.userName
      });
    }
  });
  return users;
}
