# API + APP EVENTOS - NodeJs

Una API completa para la gestión de eventos que permite explorar, crear, modificar y gestionar eventos futuros, así como inscribirse en ellos y listar participantes.

## Características

- ✅ Autenticación JWT
- ✅ CRUD completo de eventos
- ✅ Gestión de ubicaciones de eventos
- ✅ Sistema de inscripciones a eventos
- ✅ Búsqueda y filtrado de eventos
- ✅ Paginación
- ✅ Validaciones de datos
- ✅ Arquitectura en capas (Controller-Service-Repository)

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **dotenv** - Variables de entorno

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd tpintegradorprimercuatrimestrettjfjp
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con:
```
DB_HOST=localhost
DB_DATABASE=eventos_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_PORT=5432
JWT_SECRET=tu_jwt_secret_key
PORT=3000
```

4. Configurar la base de datos PostgreSQL con las tablas necesarias.

5. Ejecutar el servidor:
```bash
npm run server
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### Autenticación

#### POST /api/user/register
Registra un nuevo usuario.

**Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "username": "juan.perez@email.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "juan.perez@email.com"
  }
}
```

#### POST /api/user/login
Inicia sesión y obtiene token JWT.

**Body:**
```json
{
  "username": "juan.perez@email.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Eventos (Públicos)

#### GET /api/event
Lista todos los eventos con paginación y filtros.

**Query Parameters:**
- `limit` (opcional): Número de eventos por página (default: 15)
- `offset` (opcional): Número de eventos a saltar (default: 0)
- `name` (opcional): Filtrar por nombre
- `startdate` (opcional): Filtrar por fecha (YYYY-MM-DD)
- `tag` (opcional): Filtrar por tag

**Ejemplos:**
```
GET /api/event?limit=10&offset=0
GET /api/event?name=taylor&startdate=2025-03-03&tag=Rock
GET /api/event?startdate=2025-08-21
```

**Respuesta (200):**
```json
{
  "collection": [
    {
      "id": 2,
      "name": "Taylor Swift",
      "description": "Un alto show",
      "start_date": "2024-03-21T03:00:00.000Z",
      "duration_in_minutes": 210,
      "price": "15500",
      "enabled_for_enrollment": true,
      "max_assistance": 120000,
      "creator_user": {
        "id": 3,
        "first_name": "Julian",
        "last_name": "Schiffer",
        "username": "Jschiffer"
      },
      "event_location": {
        "id": 1,
        "name": "Club Atlético River Plate",
        "full_address": "Av. Pres. Figueroa Alcorta 7597",
        "latitude": -34.54454505693356,
        "longitude": -58.4494761175694,
        "max_capacity": "84567",
        "location": {
          "id": 3391,
          "name": "Nuñez",
          "latitude": -34.548805236816406,
          "longitude": -58.463230133056641,
          "province": {
            "id": 1,
            "name": "Ciudad Autónoma de Buenos Aires",
            "full_name": "Ciudad Autónoma de Buenos Aires",
            "latitude": -34.61444091796875,
            "longitude": -58.445877075195312
          }
        }
      },
      "tags": [
        {
          "id": 1,
          "name": "Rock"
        },
        {
          "id": 2,
          "name": "Pop"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 15,
    "offset": 0,
    "total": 50
  }
}
```

#### GET /api/event/:id
Obtiene el detalle completo de un evento específico.

**Respuesta (200):**
```json
{
  "id": 8,
  "name": "Toto",
  "description": "La legendaria banda estadounidense se presentará en Buenos Aires.",
  "id_event_location": 2,
  "start_date": "2024-11-22T03:00:00.000Z",
  "duration_in_minutes": 120,
  "price": "150000",
  "enabled_for_enrollment": "1",
  "max_assistance": 12000,
  "id_creator_user": 1,
  "event_location": {
    "id": 2,
    "name": "Movistar Arena",
    "full_address": "Humboldt 450, C1414 Cdad. Autónoma de Buenos Aires",
    "max_capacity": "15000",
    "latitude": "-34.593488697344405",
    "longitude": "-58.44735886932156",
    "id_creator_user": 1,
    "location": {
      "id": 3397,
      "name": "Villa Crespo",
      "id_province": 2,
      "latitude": "-34.599876403808594",
      "longitude": "-58.438816070556641",
      "province": {
        "id": 2,
        "name": "Ciudad Autónoma de Buenos Aires",
        "full_name": "Ciudad Autónoma de Buenos Aires",
        "latitude": "-34.61444091796875",
        "longitude": "-58.445877075195312"
      }
    },
    "creator_user": {
      "id": 1,
      "first_name": "Pablo",
      "last_name": "Ulman",
      "username": "pablo.ulman@ort.edu.ar"
    }
  },
  "tags": [
    {
      "id": 1,
      "name": "rock"
    },
    {
      "id": 2,
      "name": "pop"
    }
  ],
  "creator_user": {
    "id": 1,
    "first_name": "Pablo",
    "last_name": "Ulman",
    "username": "pablo.ulman@ort.edu.ar"
  }
}
```

### Eventos (Protegidos - Requieren Autenticación)

#### POST /api/event
Crea un nuevo evento.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Concierto de Rock",
  "description": "Un increíble concierto de rock",
  "id_event_location": 1,
  "start_date": "2025-06-15T20:00:00.000Z",
  "duration_in_minutes": 180,
  "price": 5000,
  "enabled_for_enrollment": true,
  "max_assistance": 1000
}
```

#### PUT /api/event/:id
Actualiza un evento existente (solo el creador).

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/event/:id
Elimina un evento (solo el creador, si no hay inscripciones).

**Headers:**
```
Authorization: Bearer <token>
```

### Inscripciones (Protegidas)

#### POST /api/event/:id/enrollment
Inscribe al usuario autenticado en un evento.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/event/:id/enrollment
Desinscribe al usuario autenticado de un evento.

**Headers:**
```
Authorization: Bearer <token>
```

### Ubicaciones de Eventos (Protegidas)

#### GET /api/event-location
Lista las ubicaciones del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/event-location/:id
Obtiene una ubicación específica del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/event-location
Crea una nueva ubicación de evento.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Estadio Monumental",
  "full_address": "Av. Pres. Figueroa Alcorta 7597",
  "id_location": 3391,
  "max_capacity": 84567,
  "latitude": -34.54454505693356,
  "longitude": -58.4494761175694
}
```

#### PUT /api/event-location/:id
Actualiza una ubicación existente.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/event-location/:id
Elimina una ubicación (si no está siendo usada por eventos).

**Headers:**
```
Authorization: Bearer <token>
```

## Códigos de Estado HTTP

- **200** - OK (Operación exitosa)
- **201** - Created (Recurso creado exitosamente)
- **400** - Bad Request (Datos inválidos)
- **401** - Unauthorized (No autenticado)
- **403** - Forbidden (No autorizado)
- **404** - Not Found (Recurso no encontrado)
- **500** - Internal Server Error (Error del servidor)

## Validaciones

### Usuario
- Nombre y apellido: mínimo 3 caracteres
- Email: formato válido
- Contraseña: mínimo 3 caracteres

### Evento
- Nombre y descripción: mínimo 3 caracteres
- Precio y duración: no pueden ser negativos
- Capacidad máxima: no puede superar la capacidad de la ubicación

### Ubicación
- Nombre y dirección: mínimo 3 caracteres
- Capacidad máxima: debe ser mayor a 0

## Estructura del Proyecto

```
src/
├── configs/
│   └── db-config.js          # Configuración de base de datos
├── controllers/
│   ├── event-controller.js    # Controlador de eventos
│   ├── event-location-controller.js # Controlador de ubicaciones
│   └── user-controller.js     # Controlador de usuarios
├── entities/                  # Entidades del modelo
├── helpers/
│   └── validation-helper.js   # Funciones de validación
├── middlewares/
│   └── authentication-middleware.js # Middleware de autenticación
├── repositories/
│   ├── event-repository.js    # Repositorio de eventos
│   ├── event-location-repository.js # Repositorio de ubicaciones
│   └── user-repository.js     # Repositorio de usuarios
├── services/
│   ├── event-service.js       # Servicio de eventos
│   ├── event-location-service.js # Servicio de ubicaciones
│   └── user-service.js        # Servicio de usuarios
└── server.js                  # Archivo principal del servidor
```

## Testing con Postman

Para probar la API, puedes usar Postman con la siguiente colección:

1. **Registrar usuario**: POST `/api/user/register`
2. **Login**: POST `/api/user/login`
3. **Listar eventos**: GET `/api/event`
4. **Crear evento**: POST `/api/event` (con token)
5. **Inscribirse**: POST `/api/event/:id/enrollment` (con token)

## Notas Importantes

- Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>`
- Los tokens JWT expiran en 24 horas
- Las contraseñas se encriptan con bcrypt
- La paginación es obligatoria para listados grandes
- Los eventos no se pueden eliminar si tienen participantes inscritos
- Las ubicaciones no se pueden eliminar si están siendo usadas por eventos 
