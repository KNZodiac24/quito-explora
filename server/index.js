import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import supabase from './config/database.js';

import authRoutes from './routes/auth.js';
import eventosRoutes from './routes/eventos.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/client', express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/chat', chatRoutes);

// WebSocket para chat en tiempo real por evento
const clients = new Map(); // Map de WebSocket -> {userId, userName, eventoId}

wss.on('connection', (ws, req) => {
  console.log('Nueva conexión WebSocket');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      // Autenticar usuario con token de Supabase
      if (data.type === 'auth') {
        try {
          const { data: userData, error } = await supabase.auth.getUser(data.token);
          
          if (error || !userData.user) {
            ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Token inválido' }));
            ws.close();
            return;
          }

          const user = userData.user;
          ws.userId = user.id;
          ws.userName = user.user_metadata?.nombre || user.email;
          ws.eventoId = data.eventoId; // Guardar el ID del evento
          clients.set(ws, { userId: user.id, userName: ws.userName, eventoId: data.eventoId });
          ws.send(JSON.stringify({ type: 'auth', success: true }));
          console.log(`Usuario autenticado: ${ws.userName} en evento ${data.eventoId}`);
        } catch (error) {
          console.error('Error en autenticación WebSocket:', error);
          ws.send(JSON.stringify({ type: 'auth', success: false, error: 'Error de autenticación' }));
          ws.close();
        }
        return;
      }

      // Manejar mensaje de chat
      if (data.type === 'chat' && ws.userName && ws.eventoId) {
        const messageData = {
          type: 'chat',
          evento_id: ws.eventoId,
          usuario_nombre: ws.userName,
          contenido: data.contenido,
          fecha_envio: new Date().toISOString()
        };

        // Broadcast solo a los clientes conectados al mismo evento
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN && client.eventoId === ws.eventoId) {
            client.send(JSON.stringify(messageData));
          }
        });
      }
    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Conexión WebSocket cerrada');
  });

  ws.on('error', (error) => {
    console.error('Error en WebSocket:', error);
  });
});

// Rutas de página (Server-Side Rendering)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}`);
});
