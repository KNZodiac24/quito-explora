const { useState, useEffect } = window.React;
const { Login, Register, ForgotPassword, Dashboard } = window;

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    } else {
      // Determinar vista inicial basada en la URL
      const path = window.location.pathname;
      if (path === '/register') {
        setCurrentView('register');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot-password');
      } else if (path === '/dashboard') {
        setCurrentView('login');
      } else {
        setCurrentView('login');
      }
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
    window.history.pushState({}, '', '/login');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.history.pushState({}, '', `/${view === 'login' ? '' : view}`);
  };

  return (
    <div className="app">
      {currentView === 'login' && (
        <Login onLogin={handleLogin} onNavigate={handleNavigate} />
      )}
      {currentView === 'register' && (
        <Register onNavigate={handleNavigate} />
      )}
      {currentView === 'forgot-password' && (
        <ForgotPassword onNavigate={handleNavigate} />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

window.App = App;
