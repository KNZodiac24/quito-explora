import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, telefono, direccion } = req.body;

    // Validar datos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre,
        email,
        password: hashedPassword,
        telefono,
        direccion,
        rol: 'usuario'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscar usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        nombre: usuario.nombre,
        rol: usuario.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar cookie con el token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout exitoso' });
});

// Recuperar contraseña (verificar email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio' });
    }

    // Verificar si el usuario existe
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, email, nombre')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(404).json({ error: 'El email no está registrado' });
    }

    // Email existe, devolver éxito
    res.json({ 
      message: 'Email verificado correctamente',
      email: usuario.email
    });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});

// Restablecer contraseña
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email y nueva contraseña son obligatorios' });
    }

    // Verificar que el usuario existe
    const { data: usuario, error: findError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (findError || !usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const { error } = await supabase
      .from('usuarios')
      .update({ password: hashedPassword })
      .eq('id', usuario.id);

    if (error) throw error;

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

export default router;
