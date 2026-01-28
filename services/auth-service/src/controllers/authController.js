import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, verifyToken } from '../services/jwtService.js';

const prisma = new PrismaClient();

export async function register(req, res) {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        telefono,
        direccion
      }
    });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada exitosamente' });
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      return res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' });
    }

    // En producción aquí enviarías un email con un token de reset
    // Por ahora solo retornamos un mensaje
    console.log(`Password reset requested for: ${email}`);

    res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
}

// Endpoint interno para validar tokens (usado por otros microservicios)
export async function validateToken(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '') || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ valid: false, error: 'Token inválido' });
  }

  res.json({
    valid: true,
    user: {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      rol: decoded.rol
    }
  });
}

// Obtener usuario por ID (endpoint interno)
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}
