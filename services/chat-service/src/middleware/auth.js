const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

export async function validateToken(token) {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/internal/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validando token:', error);
    return { valid: false, error: 'Error de conexión con auth-service' };
  }
}

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const data = await validateToken(token);

    if (!data.valid) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = data.user;
    next();
  } catch (error) {
    console.error('Error en middleware de auth:', error);
    res.status(500).json({ error: 'Error de autenticación' });
  }
}
