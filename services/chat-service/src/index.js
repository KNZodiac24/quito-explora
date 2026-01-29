import express from 'express';
import cors from 'cors';
import http from 'http';
import chatRoutes from './routes/chat.js';
import { setupWebSocket } from './websocket/chatHandler.js';
import { metricsMiddleware, metricsHandler } from './metrics.js';

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Metrics middleware
app.use(metricsMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-service' });
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Rutas HTTP
app.use('/', chatRoutes);

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar WebSocket
setupWebSocket(server);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

server.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`);
  console.log(`WebSocket disponible en ws://localhost:${PORT}/ws`);
});
