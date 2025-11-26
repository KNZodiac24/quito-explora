DROP TABLE IF EXISTS usuarios CASCADE;
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'admin')),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS eventos CASCADE;
-- Tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Concierto', 'Teatro', 'Deportes', 'Gastronomía', 'Arte', 'Tecnología', 'Educación', 'Familiar', 'Otro')),
  fecha_evento TIMESTAMP NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME,
  lugar VARCHAR(200) NOT NULL,
  direccion_lugar TEXT,
  sector VARCHAR(100), -- Ej: Norte, Sur, Centro, Valle de los Chillos
  capacidad_max INTEGER,
  precio_entrada DECIMAL(10, 2) DEFAULT 0.00,
  organizador VARCHAR(150),
  contacto_organizador VARCHAR(100),
  imagen_url TEXT,
  es_gratuito BOOLEAN DEFAULT false,
  requiere_reserva BOOLEAN DEFAULT false,
  es_virtual BOOLEAN DEFAULT false,
  link_virtual TEXT,
  estado VARCHAR(30) DEFAULT 'Programado' CHECK (estado IN ('Programado', 'En curso', 'Finalizado', 'Cancelado')),
  edad_minima INTEGER,
  accesibilidad_discapacidad BOOLEAN DEFAULT false,
  estacionamiento_disponible BOOLEAN DEFAULT false,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS mensajes_chat CASCADE;
-- Tabla de mensajes del chat
CREATE TABLE IF NOT EXISTS mensajes_chat (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_nombre VARCHAR(100) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS idx_eventos_fecha;
DROP INDEX IF EXISTS idx_eventos_categoria;
DROP INDEX IF EXISTS idx_eventos_sector;
DROP INDEX IF EXISTS idx_eventos_estado;
DROP INDEX IF EXISTS idx_usuarios_email;
DROP INDEX IF EXISTS idx_mensajes_fecha; 
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_sector ON eventos(sector);
CREATE INDEX IF NOT EXISTS idx_eventos_estado ON eventos(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes_chat(fecha_envio DESC);

-- Datos de prueba

INSERT INTO usuarios (nombre, email, password, telefono, direccion, rol) VALUES
('Administrador Sistema', 'admin@quitoexplora.com', '$2b$10$FcsltbjiAf3EU/Ele8/Fq.d/rSPxjTIhbulFvNf/9LqgUXI6nDgby', '0998765432', 'Centro Histórico, Quito', 'admin'),
('María González', 'maria@example.com', '$2b$10$i4jPMnWzYCGb7Ps3UYI9WuQqbkFEn3yPWGHgzjDL7.FKszHSjwQei', '0987654321', 'La Carolina, Quito', 'usuario'),
('Carlos Pérez', 'carlos@example.com', '$2b$10$i4jPMnWzYCGb7Ps3UYI9WuQqbkFEn3yPWGHgzjDL7.FKszHSjwQei', '0976543210', 'Cumbayá, Quito', 'usuario'),
('Ana Rodríguez', 'ana@example.com', '$2b$10$i4jPMnWzYCGb7Ps3UYI9WuQqbkFEn3yPWGHgzjDL7.FKszHSjwQei', '0965432109', 'Quicentro Sur, Quito', 'usuario');

INSERT INTO eventos (titulo, descripcion, categoria, fecha_evento, hora_inicio, hora_fin, lugar, direccion_lugar, sector, capacidad_max, precio_entrada, organizador, contacto_organizador, imagen_url, es_gratuito, requiere_reserva, estado, edad_minima, accesibilidad_discapacidad, estacionamiento_disponible) VALUES
('Concierto Sinfónico de Fin de Año', 'La Orquesta Sinfónica Nacional presenta un concierto especial con música clásica y contemporánea para celebrar el año nuevo.', 'Concierto', '2025-12-31 19:00:00', '19:00', '22:00', 'Teatro Nacional Sucre', 'Calle Manabí N8-131 y Guayaquil', 'Centro Histórico', 800, 25.00, 'Teatro Nacional Sucre', 'info@teatrosucre.com', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600', false, true, 'Programado', 0, true, false),

('Festival de Comida Quiteña', 'Degusta los mejores platos tradicionales de Quito preparados por chefs reconocidos. Hornado, locro, empanadas y más.', 'Gastronomía', '2025-12-15 10:00:00', '10:00', '18:00', 'Parque Itchimbía', 'Loma de Itchimbía s/n', 'Centro', 2000, 0.00, 'Municipio de Quito', 'cultura@quito.gob.ec', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', true, false, 'Programado', 0, true, true),

('Ecuador Tech Summit 2025', 'El evento tecnológico más grande del año. Conferencias sobre IA, blockchain, startups y transformación digital.', 'Tecnología', '2025-12-20 09:00:00', '09:00', '18:00', 'Centro de Convenciones Metropolitano', 'Av. Amazonas y Naciones Unidas', 'Norte', 1500, 45.00, 'Ecuador Tech', 'info@ecuadortech.com', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600', false, true, 'Programado', 16, true, true),

('Obra de Teatro: "Quito en el Tiempo"', 'Una obra que narra la historia de Quito a través de personajes emblemáticos. Teatro para toda la familia.', 'Teatro', '2025-12-10 20:00:00', '20:00', '22:00', 'Teatro México', 'Av. América N36-165 y Naciones Unidas', 'Norte', 300, 15.00, 'Compañía Nacional de Teatro', 'teatro@cultura.gob.ec', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600', false, true, 'Programado', 8, true, false),

('Maratón de Quito 2025', 'Corre por las calles históricas de Quito. Categorías: 5K, 10K, 21K y 42K. Inscripciones abiertas.', 'Deportes', '2025-12-07 06:00:00', '06:00', '12:00', 'Parque La Carolina', 'Av. Eloy Alfaro y Av. República', 'Norte', 5000, 30.00, 'Federación Ecuatoriana de Atletismo', 'maraton@quito.com', 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600', false, true, 'Programado', 15, false, true),

('Exposición: Arte Contemporáneo Ecuatoriano', 'Muestra de obras de artistas ecuatorianos emergentes. Pintura, escultura y arte digital.', 'Arte', '2025-12-05 10:00:00', '10:00', '19:00', 'Centro de Arte Contemporáneo', 'Calle Montevideo y Luis Dávila', 'Centro', 500, 5.00, 'Ministerio de Cultura', 'arte@cultura.gob.ec', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600', false, false, 'Programado', 0, true, false),

('Feria de Ciencias para Niños', 'Experimentos interactivos, talleres de robótica y actividades STEM para niños de 5 a 12 años.', 'Educación', '2025-12-12 09:00:00', '09:00', '16:00', 'Museo Interactivo de Ciencia', 'Calle Sincholagua y Av. Maldonado', 'Sur', 800, 0.00, 'Fundación Museos de la Ciudad', 'mic@fmcquito.gob.ec', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600', true, false, 'Programado', 5, true, true),

('Noche de Jazz en Vivo', 'Disfruta de una velada con los mejores exponentes del jazz ecuatoriano e internacional.', 'Concierto', '2025-12-18 21:00:00', '21:00', '23:30', 'Jazz Club Quito', 'Calle Pinto E4-385 y Av. Amazonas', 'Centro', 150, 20.00, 'Jazz Club Quito', 'reservas@jazzclubquito.com', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600', false, true, 'Programado', 18, false, false),

('Feria de Emprendimientos Locales', 'Más de 100 emprendedores quiteños presentan sus productos: artesanías, ropa, joyería, alimentos orgánicos y más.', 'Otro', '2025-12-08 11:00:00', '11:00', '20:00', 'Parque La Carolina', 'Av. Eloy Alfaro y Av. Naciones Unidas', 'Norte', 3000, 0.00, 'Cámara de Comercio de Quito', 'emprendimientos@ccq.ec', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', true, false, 'Programado', 0, true, true),

('Clase de Yoga al Aire Libre', 'Sesión grupal de yoga para todos los niveles. Trae tu mat y disfruta del aire fresco en el parque.', 'Deportes', '2025-12-06 07:00:00', '07:00', '08:30', 'Parque Metropolitano', 'Av. Simón Bolívar s/n', 'Norte', 100, 0.00, 'Quito Activo', 'yoga@quitoactivo.com', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', true, true, 'Programado', 14, true, true),

('Torneo de Fútbol Inter-Barrios', 'Competencia deportiva entre equipos de diferentes barrios de Quito. Categorías sub-15 y adultos.', 'Deportes', '2025-12-14 08:00:00', '08:00', '17:00', 'Complejo Deportivo El Arbolito', 'Av. 6 de Diciembre y Av. Tarqui', 'Centro', 1000, 0.00, 'Liga Barrial de Quito', 'futbol@ligabarrial.ec', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600', true, false, 'Programado', 0, true, true),

('Webinar: Marketing Digital 2025', 'Aprende las últimas tendencias en marketing digital, redes sociales y e-commerce. Evento virtual.', 'Tecnología', '2025-12-09 15:00:00', '15:00', '17:00', 'Evento Virtual', 'Plataforma Zoom', 'Virtual', 500, 0.00, 'Academia Digital Ecuador', 'info@academiadigital.ec', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600', true, true, 'Programado', 18, true, false);
