# QuitoExplora - Microservicios

Plataforma de eventos de Quito construida con arquitectura de microservicios.

## Arquitectura

```
Frontend (React + Vite) :3000
         |
         ├── /api/auth    → auth-service :3001    → auth_db
         ├── /api/eventos → eventos-service :3002 → eventos_db
         └── /api/chat    → chat-service :3003    → chat_db
```

## Requisitos

- Node.js 20+
- PostgreSQL 15+
- npm o yarn

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd quito-explora
```

### 2. Crear las bases de datos

Conectate a PostgreSQL y ejecuta:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE eventos_db;
CREATE DATABASE chat_db;
```

### 3. Configurar variables de entorno

Los archivos `.env` ya estan creados en cada servicio. Si tu PostgreSQL tiene credenciales diferentes, edita:

- `services/auth-service/.env`
- `services/eventos-service/.env`
- `services/chat-service/.env`

Formato de DATABASE_URL:
```
DATABASE_URL=postgresql://USUARIO:PASSWORD@localhost:5432/NOMBRE_DB
```

### 4. Instalar dependencias y crear tablas

```bash
# Auth Service
cd services/auth-service
npm install
npx prisma db push
npm run db:seed

# Eventos Service
cd ../eventos-service
npm install
npx prisma db push
npm run db:seed

# Chat Service
cd ../chat-service
npm install
npx prisma db push

# Frontend
cd ../frontend
npm install
```

### 5. Iniciar los servicios

Abre 4 terminales:

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
npm run dev
```

**Terminal 2 - Eventos Service:**
```bash
cd services/eventos-service
npm run dev
```

**Terminal 3 - Chat Service:**
```bash
cd services/chat-service
npm run dev
```

**Terminal 4 - Frontend:**
```bash
cd services/frontend
npm run dev
```

### 6. Acceder a la aplicacion

Abre el navegador en: **http://localhost:3000**

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@quitoexplora.com | password123 | admin |
| maria@example.com | password123 | usuario |
| carlos@example.com | password123 | usuario |
| ana@example.com | password123 | usuario |

## Estructura del Proyecto

```
quito-explora/
├── services/
│   ├── auth-service/       # Autenticacion (JWT)
│   │   ├── prisma/         # Schema de usuarios
│   │   └── src/
│   ├── eventos-service/    # CRUD de eventos
│   │   ├── prisma/         # Schema de eventos
│   │   └── src/
│   ├── chat-service/       # Chat en tiempo real
│   │   ├── prisma/         # Schema de mensajes
│   │   └── src/
│   └── frontend/           # React + Vite
│       └── src/
├── nginx/                  # Config para Docker
├── docker-compose.yml      # Orquestacion Docker
└── README.md
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Frontend | 3000 |
| Auth Service | 3001 |
| Eventos Service | 3002 |
| Chat Service | 3003 |
| Grafana | 3030 |
| Prometheus | 9090 |
| Postgres Exporter (Auth) | 9187 |
| Postgres Exporter (Eventos) | 9188 |
| Postgres Exporter (Chat) | 9189 |

## Endpoints API

### Auth (`/api/auth`)
- `POST /login` - Iniciar sesion
- `POST /register` - Registrar usuario
- `POST /logout` - Cerrar sesion
- `POST /forgot-password` - Recuperar contrasena

### Eventos (`/api/eventos`)
- `GET /` - Listar eventos
- `GET /:id` - Obtener evento
- `POST /` - Crear evento (admin)
- `PUT /:id` - Actualizar evento (admin)
- `DELETE /:id` - Eliminar evento (admin)
- `POST /upload-image` - Subir imagen (admin)

### Chat (`/api/chat`)
- `GET /:eventoId` - Obtener mensajes
- `POST /:eventoId` - Enviar mensaje
- `WS /ws` - WebSocket para chat en tiempo real

## Docker (Opcional)

Para ejecutar todo con Docker:

```bash
docker-compose up -d --build
```

La aplicacion estara en: **http://localhost**

## Monitoreo

El proyecto incluye monitoreo completo con Prometheus y Grafana.

### Acceso

- **Grafana**: http://localhost:3030
  - Usuario: `admin`
  - Contraseña: `admin`
- **Prometheus**: http://localhost:9090

### Dashboards Disponibles

1. **QuitoExplora - Node.js Services**
   - Request rate, latencia, uso de CPU/memoria
   - Distribución de códigos HTTP

2. **QuitoExplora - PostgreSQL Databases**
   - Conexiones activas, transacciones
   - Cache hit ratio, tamaño de base de datos

### Métricas de Servicios

Cada microservicio expone métricas en `/metrics`:
- Auth Service: http://localhost:3001/metrics (interno)
- Eventos Service: http://localhost:3002/metrics (interno)
- Chat Service: http://localhost:3003/metrics (interno)

Para más información, ver **[MONITORING.md](MONITORING.md)**.

## Tecnologias

- **Backend:** Node.js, Express, Prisma
- **Frontend:** React 18, Vite
- **Base de datos:** PostgreSQL
- **Autenticacion:** JWT + bcrypt
- **Tiempo real:** WebSocket
