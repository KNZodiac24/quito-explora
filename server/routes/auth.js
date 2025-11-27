import express from 'express';
import supabase from '../config/database.js';
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      usuario: data.user
    });
  } catch (error) {
    console.error('Error al registrar usuario: ', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = data.session.access_token;

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      message: 'Login exitoso',
      usuario: data.user
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});
// Logout de usuario
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout exitoso' });
});
// Solicitar restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es obligatorio' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al procesar solicitud' });
  }
});
// Restablecer contraseña
router.post('/reset-password', async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
    }

    const { data, error } = await supabase.auth.updateUser(
      { password: newPassword },
      { access_token: token }
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
});

export default router;
