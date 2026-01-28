import { useState } from 'react';
import { api } from '../services/api';

function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesion');
      }

      onLogin(data.usuario, data.token);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>QuitoExplora</h1>
          <p>Descubre los mejores eventos de la ciudad</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </button>

          <div className="auth-links">
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('forgot-password')}
            >
              Olvidaste tu contrasena?
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('register')}
            >
              No tienes cuenta? Registrate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
