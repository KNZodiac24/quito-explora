const { useState, useEffect } = window.React;

function EventForm({ token, eventoToEdit, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Concierto',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    lugar: '',
    direccion_lugar: '',
    sector: '',
    capacidad_max: '',
    precio_entrada: '0',
    organizador: '',
    contacto_organizador: '',
    imagen_url: '',
    es_gratuito: true,
    requiere_reserva: false,
    es_virtual: false,
    link_virtual: '',
    estado: 'Programado',
    edad_minima: '',
    accesibilidad_discapacidad: false,
    estacionamiento_disponible: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventoToEdit) {
      setFormData({
        ...eventoToEdit,
        fecha_evento: eventoToEdit.fecha_evento ? eventoToEdit.fecha_evento.substring(0, 16) : ''
      });
    }
  }, [eventoToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'es_gratuito' && checked) {
      setFormData({
        ...formData,
        [name]: checked,
        precio_entrada: '0'
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = eventoToEdit ? `/api/eventos/${eventoToEdit.id}` : '/api/eventos';
      const method = eventoToEdit ? 'PUT' : 'POST';

      const dataToSend = {
        ...formData,
        capacidad_max: formData.capacidad_max ? parseInt(formData.capacidad_max) : null,
        precio_entrada: parseFloat(formData.precio_entrada) || 0,
        edad_minima: formData.edad_minima ? parseInt(formData.edad_minima) : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar evento');
      }

      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content event-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{eventoToEdit ? 'Editar Evento' : 'Agregar Nuevo Evento'}</h2>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="titulo">Título del Evento *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ej: Concierto de Rock en Quito"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
              >
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
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="Programado">Programado</option>
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Describe el evento, qué incluye, qué pueden esperar los asistentes..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fecha_evento">Fecha y Hora *</label>
              <input
                type="datetime-local"
                id="fecha_evento"
                name="fecha_evento"
                value={formData.fecha_evento}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora_inicio">Hora de Inicio *</label>
              <input
                type="time"
                id="hora_inicio"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora_fin">Hora de Fin</label>
              <input
                type="time"
                id="hora_fin"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lugar">Lugar *</label>
              <input
                type="text"
                id="lugar"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                required
                placeholder="Ej: Teatro Nacional Sucre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sector">Sector</label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Centro">Centro</option>
                <option value="Centro Histórico">Centro Histórico</option>
                <option value="Valle de los Chillos">Valle de los Chillos</option>
                <option value="Valle de Tumbaco">Valle de Tumbaco</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="direccion_lugar">Dirección</label>
            <input
              type="text"
              id="direccion_lugar"
              name="direccion_lugar"
              value={formData.direccion_lugar}
              onChange={handleChange}
              placeholder="Ej: Av. Amazonas N24-03 y Wilson"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="organizador">Organizador</label>
              <input
                type="text"
                id="organizador"
                name="organizador"
                value={formData.organizador}
                onChange={handleChange}
                placeholder="Ej: Municipio de Quito"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contacto_organizador">Contacto</label>
              <input
                type="text"
                id="contacto_organizador"
                name="contacto_organizador"
                value={formData.contacto_organizador}
                onChange={handleChange}
                placeholder="Email o teléfono"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacidad_max">Capacidad Máxima</label>
              <input
                type="number"
                id="capacidad_max"
                name="capacidad_max"
                value={formData.capacidad_max}
                onChange={handleChange}
                min="0"
                placeholder="Número de asistentes"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edad_minima">Edad Mínima</label>
              <input
                type="number"
                id="edad_minima"
                name="edad_minima"
                value={formData.edad_minima}
                onChange={handleChange}
                min="0"
                placeholder="0 = todas las edades"
              />
            </div>

            <div className="form-group">
              <label htmlFor="precio_entrada">Precio ($)</label>
              <input
                type="number"
                id="precio_entrada"
                name="precio_entrada"
                value={formData.precio_entrada}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={formData.es_gratuito}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>Características:</label>
            <div className="checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="es_gratuito"
                  checked={formData.es_gratuito}
                  onChange={handleChange}
                />
                Evento Gratuito
              </label>
              <label>
                <input
                  type="checkbox"
                  name="requiere_reserva"
                  checked={formData.requiere_reserva}
                  onChange={handleChange}
                />
                Requiere Reserva
              </label>
              <label>
                <input
                  type="checkbox"
                  name="es_virtual"
                  checked={formData.es_virtual}
                  onChange={handleChange}
                />
                Evento Virtual
              </label>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>Accesibilidad:</label>
            <div className="checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="accesibilidad_discapacidad"
                  checked={formData.accesibilidad_discapacidad}
                  onChange={handleChange}
                />
                Accesible para personas con discapacidad
              </label>
              <label>
                <input
                  type="checkbox"
                  name="estacionamiento_disponible"
                  checked={formData.estacionamiento_disponible}
                  onChange={handleChange}
                />
                Estacionamiento disponible
              </label>
            </div>
          </div>

          {formData.es_virtual && (
            <div className="form-group">
              <label htmlFor="link_virtual">Link del Evento Virtual</label>
              <input
                type="url"
                id="link_virtual"
                name="link_virtual"
                value={formData.link_virtual}
                onChange={handleChange}
                placeholder="https://zoom.us/j/..."
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="imagen_url">URL de la Imagen</label>
            <input
              type="url"
              id="imagen_url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : eventoToEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

window.EventForm = EventForm;
