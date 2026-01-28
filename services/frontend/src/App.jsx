import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    } else {
      const path = window.location.pathname;
      if (path === '/register') {
        setCurrentView('register');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot-password');
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
    window.history.pushState({}, '', '/');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    const path = view === 'login' ? '/' : `/${view}`;
    window.history.pushState({}, '', path);
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

export default App;
