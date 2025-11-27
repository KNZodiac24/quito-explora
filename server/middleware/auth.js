import supabase from '../config/database.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const user = data.user;

    req.user = {
      id: user.id,
      email: user.email,
      nombre: user.user_metadata?.nombre || null,
      rol: user.user_metadata?.rol || 'usuario'
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ error: 'No autorizado' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

export { authMiddleware, adminMiddleware };
