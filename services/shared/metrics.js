import client from 'prom-client';

// Crear registro de métricas
const register = new client.Registry();

// Agregar métricas por defecto (CPU, memoria, etc.)
client.collectDefaultMetrics({ register });

// Histograma para medir duración de requests HTTP
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

// Contador de requests HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Gauge para conexiones de base de datos
const dbConnectionsActive = new client.Gauge({
  name: 'db_connections_active',
  help: 'Number of active database connections'
});

// Registrar métricas personalizadas
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(dbConnectionsActive);

/**
 * Middleware para registrar métricas de requests HTTP
 */
export const metricsMiddleware = (req, res, next) => {
  // Obtener ruta sin parámetros dinámicos para agrupar métricas
  const route = req.route?.path || req.path || 'unknown';
  
  // Ignorar el endpoint de métricas
  if (route === '/metrics') {
    return next();
  }

  const start = Date.now();

  // Capturar el evento de finalización de la respuesta
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // convertir a segundos
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
  });

  next();
};

/**
 * Handler para el endpoint /metrics
 */
export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
};

/**
 * Actualizar el gauge de conexiones activas de base de datos
 */
export const updateDbConnections = (count) => {
  dbConnectionsActive.set(count);
};

export { register };
