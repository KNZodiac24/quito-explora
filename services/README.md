# QuitoExplora - Microservicios

Arquitectura de microservicios para la aplicacion QuitoExplora.

## Arquitectura

```
                    NGINX (API Gateway) :80
                           |
        +------------------+------------------+
        |                  |                  |
        v                  v                  v
  auth-service:3001  eventos-service:3002  chat-service:3003
        |                  |                  |
        v                  v                  v
     auth_db           eventos_db          chat_db
    (usuarios)         (eventos)       (mensajes_chat)
```

## Servicios

- **auth-service**: Autenticacion (registro, login, JWT)
- **eventos-service**: CRUD de eventos
- **chat-service**: Chat en tiempo real con WebSocket
- **frontend**: React SPA con Vite

## Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)

## Inicio Rapido con Docker

```bash
# Desde la raiz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

La aplicacion estara disponible en: http://localhost

## Desarrollo Local

### 1. Iniciar bases de datos

```bash
docker-compose up -d auth-db eventos-db chat-db
```

### 2. Configurar cada servicio

**Auth Service:**
```bash
cd services/auth-service
npm install
cp .env.example .env  # Crear archivo .env
npx prisma db push
npm run db:seed  # Opcional: cargar datos de prueba
npm run dev
```

**Eventos Service:**
```bash
cd services/eventos-service
npm install
npx prisma db push
npm run db:seed  # Opcional: cargar datos de prueba
npm run dev
```

**Chat Service:**
```bash
cd services/chat-service
npm install
npx prisma db push
npm run dev
```

**Frontend:**
```bash
cd services/frontend
npm install
npm run dev
```

### Variables de Entorno

Crear archivo `.env` en la raiz del proyecto:

```env
# JWT
JWT_SECRET=tu-secreto-jwt-aqui

# Passwords de las bases de datos
AUTH_DB_PASSWORD=auth_secure_password_123
EVENTOS_DB_PASSWORD=eventos_secure_password_123
CHAT_DB_PASSWORD=chat_secure_password_123
```

## Endpoints API

### Auth Service (/api/auth/)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /register | Registrar usuario |
| POST | /login | Iniciar sesion |
| POST | /logout | Cerrar sesion |
| POST | /forgot-password | Recuperar contrasena |

### Eventos Service (/api/eventos/)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | / | Listar eventos |
| GET | /search?q= | Buscar eventos |
| GET | /:id | Obtener evento |
| POST | / | Crear evento (admin) |
| PUT | /:id | Actualizar evento (admin) |
| DELETE | /:id | Eliminar evento (admin) |
| POST | /upload-image | Subir imagen (admin) |

### Chat Service (/api/chat/)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /:eventoId | Obtener mensajes |
| POST | /:eventoId | Enviar mensaje |
| WS | /ws | WebSocket para chat |

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@quitoexplora.com | password123 | admin |
| maria@example.com | password123 | usuario |
| carlos@example.com | password123 | usuario |

## Tecnologias

- **Backend**: Node.js, Express, Prisma
- **Frontend**: React 18, Vite
- **Base de datos**: PostgreSQL
- **Contenedores**: Docker, Docker Compose
- **API Gateway**: Nginx
- **Tiempo real**: WebSocket (ws)
