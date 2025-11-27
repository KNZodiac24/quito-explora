const { useState, useEffect } = window.React;

function ResetPassword({ onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    const accessToken = params.get("access_token");

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: params.get("refresh_token")
      });

      setToken(accessToken);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError("Token no encontrado en el enlace de recuperación.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Contraseña actualizada con éxito");
    setTimeout(() => onNavigate('login'), 2000);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Restablecer Contraseña</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e)=>setConfirm(e.target.value)}
            />
          </div>

          <button className="btn btn-primary">Guardar contraseña</button>
        </form>
      </div>
    </div>
  );
}

window.ResetPassword = ResetPassword;
