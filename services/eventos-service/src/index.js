import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import eventosRoutes from './routes/eventos.js';
import { metricsMiddleware, metricsHandler } from './metrics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Metrics middleware
app.use(metricsMiddleware);

// Servir archivos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'eventos-service' });
});

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Rutas
app.use('/', eventosRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'Tipo de archivo no permitido') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Eventos service running on port ${PORT}`);
});
