const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const response = await fetch(`${AUTH_SERVICE_URL}/internal/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!data.valid) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    console.error('Error validando token:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
}

export async function adminMiddleware(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}
