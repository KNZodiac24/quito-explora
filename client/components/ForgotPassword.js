const { useState } = window.React;

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar solicitud');
      }

      setSuccess("Revisa tu correo y sigue el enlace para restablecer la contraseña");
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
          <h1>Recuperar Contraseña</h1>
          <p>Ingresa tu email y te enviaremos un enlace</p>
        </div>

        <form onSubmit={handleRequestReset} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              placeholder="tu@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>

          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate('login')}
          >
            Volver al inicio de sesión
          </button>
        </form>
      </div>
    </div>
  );
}

window.ForgotPassword = ForgotPassword;
