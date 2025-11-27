const { useState, useEffect } = window.React;
const { EventList, EventForm, Chat } = window;

function Dashboard({ user, token, onLogout }) {
  const [eventos, setEventos] = useState([]);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [chatEvento, setChatEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    sector: '',
    estado: '',
  });

  const isAdmin = user.rol === 'admin';

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/eventos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEventos(data);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar eventos localmente
  const filteredEventos = eventos.filter(evento => {
    if (filters.search && !evento.titulo.toLowerCase().includes(filters.search.toLowerCase()) &&
        !evento.descripcion?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !evento.lugar?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.categoria && evento.categoria !== filters.categoria) return false;
    if (filters.sector && evento.sector !== filters.sector) return false;
    if (filters.estado && evento.estado !== filters.estado) return false;
    return true;
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleAddEvento = () => {
    setSelectedEvento(null);
    setShowForm(true);
  };

  const handleEditEvento = (evento) => {
    setSelectedEvento(evento);
    setShowForm(true);
  };

  const handleDeleteEvento = async (eventoId) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchEventos();
      } else {
        alert('Error al eliminar evento');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar evento');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEvento(null);
    fetchEventos();
  };

  const handleOpenChat = (evento) => {
    setChatEvento(evento);
  };

  const handleCloseChat = () => {
    setChatEvento(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/img/logo.png" alt="QuitoExplora" className="dashboard-logo" />
          <div className="user-info">
            <span className="user-name">
              {user.nombre} {isAdmin && <span className="badge-admin">Admin</span>}
            </span>
            <button onClick={onLogout} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <div className="filters-section">
            <input
              type="text"
              name="search"
              placeholder="Buscar por título, descripción o lugar..."
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />

            <select name="categoria" value={filters.categoria} onChange={handleFilterChange}>
              <option value="">Todas las categorías</option>
              <option value="Concierto">Concierto</option>
              <option value="Teatro">Teatro</option>
              <option value="Deportes">Deportes</option>
              <option value="Gastronomía">Gastronomía</option>
              <option value="Arte">Arte</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Educación">Educación</option>
              <option value="Familiar">Familiar</option>
              <option value="Otro">Otro</option>
            </select>

            <select name="sector" value={filters.sector} onChange={handleFilterChange}>
              <option value="">Todos los sectores</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Centro">Centro</option>
              <option value="Centro Histórico">Centro Histórico</option>
              <option value="Valle de los Chillos">Valle de los Chillos</option>
              <option value="Valle de Tumbaco">Valle de Tumbaco</option>
              <option value="Virtual">Virtual</option>
            </select>

            <select name="estado" value={filters.estado} onChange={handleFilterChange}>
              <option value="">Todos los estados</option>
              <option value="Programado">Programado</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {isAdmin && (
              <button onClick={handleAddEvento} className="btn btn-success">
                + Agregar Evento
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">Cargando eventos...</div>
        ) : (
          <EventList
            eventos={filteredEventos}
            token={token}
            isAdmin={isAdmin}
            onEdit={isAdmin ? handleEditEvento : null}
            onOpenChat={handleOpenChat}
          />
        )}

        {showForm && (
          <EventForm
            eventoToEdit={selectedEvento}
            token={token}
            onCancel={() => setShowForm(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </main>

      {/* Chat del evento */}
      {chatEvento && (
        <Chat 
          user={user} 
          token={token} 
          evento={chatEvento}
          onClose={handleCloseChat} 
        />
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
