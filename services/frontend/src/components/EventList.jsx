import { useState } from 'react';

function EventList({ eventos, token, isAdmin, onEdit, onOpenChat, onRefresh }) {
  const [error, setError] = useState('');

  const onDelete = async (id) => {
    if (!window.confirm('Estas seguro de eliminar este evento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar evento');
      }

      onRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!eventos || eventos.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron eventos con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-grid">
        {eventos.map((evento) => (
          <div key={evento.id} className="event-card">
            {evento.imagen_url && (
              <div className="event-image">
                <img src={evento.imagen_url} alt={evento.titulo} />
                {evento.es_gratuito && (
                  <span className="badge badge-free">GRATIS</span>
                )}
              </div>
            )}

            <div className="event-content">
              <div className="event-header">
                <h3>{evento.titulo}</h3>
                <span className={`badge badge-${evento.estado.toLowerCase().replace(' ', '-')}`}>
                  {evento.estado}
                </span>
              </div>

              <div className="event-category">
                <span className="category-badge">{evento.categoria}</span>
              </div>

              <div className="event-info">
                <p className="event-date">
                  <strong>{formatDate(evento.fecha_evento)}</strong>
                </p>
                <p className="event-time">
                  <strong>{formatTime(evento.hora_inicio)}</strong>
                  {evento.hora_fin && ` - ${formatTime(evento.hora_fin)}`}
                </p>
                <p className="event-location">
                  <strong>{evento.lugar}</strong>
                  {evento.sector && ` (${evento.sector})`}
                </p>
                {evento.direccion_lugar && (
                  <p className="event-address">{evento.direccion_lugar}</p>
                )}
              </div>

              {evento.descripcion && (
                <p className="event-description">{evento.descripcion}</p>
              )}

              <div className="event-details">
                {!evento.es_gratuito && evento.precio_entrada > 0 && (
                  <span className="event-price">
                    ${parseFloat(evento.precio_entrada).toFixed(2)}
                  </span>
                )}
                {evento.capacidad_max && (
                  <span className="event-capacity">
                    Capacidad: {evento.capacidad_max}
                  </span>
                )}
                {evento.es_virtual && (
                  <span className="badge badge-virtual">Virtual</span>
                )}
              </div>

              {evento.organizador && (
                <p className="event-organizer">
                  <strong>Organiza:</strong> {evento.organizador}
                </p>
              )}

              {evento.requiere_reserva && (
                <p className="event-reservation">
                  <strong>Requiere reserva previa</strong>
                </p>
              )}

              <div className="event-features">
                {evento.edad_minima !== null && evento.edad_minima !== undefined && (
                  <span className="badge-info">
                    {evento.edad_minima === 0 ? 'Todas las edades' : `+${evento.edad_minima} anos`}
                  </span>
                )}
                {evento.accesibilidad_discapacidad && (
                  <span className="badge-info">Accesible</span>
                )}
                {evento.estacionamiento_disponible && (
                  <span className="badge-info">Parking</span>
                )}
              </div>

              {evento.link_virtual && (
                <a
                  href={evento.link_virtual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-link"
                >
                  Ir al evento virtual
                </a>
              )}

              <div className="event-actions">
                <button
                  onClick={() => onOpenChat(evento)}
                  className="btn btn-small btn-chat"
                  title="Abrir chat del evento"
                >
                  Chat
                </button>

                {isAdmin && (
                  <>
                    <button onClick={() => onEdit(evento)} className="btn btn-small btn-primary">
                      Editar
                    </button>
                    <button onClick={() => onDelete(evento.id)} className="btn btn-small btn-danger">
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;
