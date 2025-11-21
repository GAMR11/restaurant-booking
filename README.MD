# 🍽️ Restaurant Booking System

Sistema completo de gestión de reservas para restaurantes con integración a Google Calendar, selección de menú y gestión de horarios en tiempo real.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)

[Demo en Vivo](https://front-restaurant-booking-production.up.railway.app) | [API Docs](https://backend-restaurant-booking-production.up.railway.app/health) | [Reporte de Issues](https://github.com/GAMR11/restaurant-booking/issues)

---

## 📸 Screenshots

### Pantalla Principal
![Home](docs/screenshots/home_restaurant_booking.png)

### Proceso de Reserva
![Booking Process](docs/screenshots/step1_restaurant_booking.png)

### Selección de Horario
![Menu Selection](docs/screenshots/step2_restaurant_booking_complete.png)

### Selección de Menú
![Menu Selection](docs/screenshots/step3_restaurant_booking.png)

### Confirmación
![Menu Selection](docs/screenshots/step4_restaurant_booking.png)

### TYP
![Menu Selection](docs/screenshots/typ_restaurant_booking.png)

---

## ✨ Características

### 🎯 Core Features
- ✅ **Reservas en Tiempo Real** - Sistema de disponibilidad por franjas horarias de 30 minutos
- ✅ **Integración Google Calendar** - Sincronización automática de reservas
- ✅ **Selección de Menú** - Catálogo de platillos con imágenes y precios
- ✅ **Gestión de Duraciones** - Reservas desde 30 minutos hasta 8 horas
- ✅ **Validación Inteligente** - Verificación de capacidad y disponibilidad
- ✅ **Notificaciones por Email** - Confirmaciones automáticas

### 💼 Funcionalidades Avanzadas
- 📅 Bloqueo de fechas especiales
- 🍽️ Categorías de menú (Entradas, Platos Fuertes, Postres, Bebidas)
- 👥 Gestión de capacidad por turno
- 🔄 Actualización en tiempo real de disponibilidad
- 📊 Panel de estadísticas (próximamente)
- 🌐 Multi-idioma (próximamente)

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.2** + **TypeScript 5.3**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **date-fns** para manejo de fechas

### Backend
- **Node.js 18** + **Express**
- **TypeScript**
- **Prisma ORM** con PostgreSQL
- **Google Calendar API**
- **CORS** configurado

### Base de Datos
- **PostgreSQL 15**
- Migraciones con Prisma
- Seed data incluido

### Infraestructura
- **Docker** & **Docker Compose**
- **Railway** para deployment
- **Nginx** para servir frontend
- CI/CD con GitHub

---

## 🚀 Instalación Rápida

### Requisitos Previos
- [Docker](https://www.docker.com/get-started) y Docker Compose
- [Git](https://git-scm.com/)
- (Opcional) [Node.js 18+](https://nodejs.org/) para desarrollo local

### Método 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/GAMR11/restaurant-booking.git
cd restaurant-booking

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores (ver sección de Configuración)

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Esperar a que inicien los servicios (30-60 segundos)
docker-compose logs -f

# 5. Acceder a la aplicación
# Frontend: http://localhost
# Backend: http://localhost:5000/health
# Prisma Studio: http://localhost:5555 (ejecutar: docker-compose exec backend npx prisma studio)
```

### Método 2: Desarrollo Local

#### Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev
npm run seed

# Iniciar servidor de desarrollo
npm run dev
# Backend corriendo en http://localhost:5000
```

#### Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
# Frontend corriendo en http://localhost:3000
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

```env
# Base de Datos
POSTGRES_USER=restaurant_user
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=restaurant_reservations

# Backend
PORT=5000
NODE_ENV=development

# Google Calendar API (Opcional)
GOOGLE_CLIENT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=tu-calendario@group.calendar.google.com

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Configurar Google Calendar (Opcional)

<details>
<summary>Click para ver instrucciones detalladas</summary>

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita "Google Calendar API"
4. Crea una Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Descarga el archivo JSON con las credenciales
5. Comparte tu calendario con el email de la Service Account
6. Copia los valores al `.env`:
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`
   - ID de tu calendario → `GOOGLE_CALENDAR_ID`

**Nota**: El sistema funciona sin Google Calendar, pero las reservas no se sincronizarán.
</details>

---

## 📁 Estructura del Proyecto

```
restaurant-booking/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuraciones (DB, Google Calendar)
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── types/           # Tipos de TypeScript
│   │   ├── utils/           # Utilidades
│   │   └── index.ts         # Punto de entrada
│   ├── prisma/
│   │   ├── migrations/      # Migraciones de BD
│   │   ├── schema.prisma    # Schema de Prisma
│   │   └── seed.ts          # Datos iniciales
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── BookingForm/ # Formulario de reservas
│   │   │   └── common/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # API services
│   │   ├── types/           # Tipos TypeScript
│   │   └── App.tsx
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 📚 Uso

### Crear una Reserva

1. Accede a http://localhost
2. Click en "Hacer una Reserva"
3. **Paso 1: Información Personal**
   - Nombre completo
   - Email
   - Teléfono
4. **Paso 2: Fecha y Hora**
   - Selecciona fecha
   - Selecciona número de personas
   - Elige horario de inicio y fin
5. **Paso 3: Detalles**
   - Tipo de menú
   - Ocasión especial (opcional)
   - Restricciones alimentarias
   - Solicitudes especiales
6. **Paso 4: Confirmar**
   - Revisa todos los detalles
   - Confirma la reserva
7. **Confirmación**
   - Recibirás un email de confirmación
   - El evento se agregará a Google Calendar

### Panel de Administración (Próximamente)

```bash
# Acceder a Prisma Studio para gestión de datos
docker-compose exec backend npx prisma studio
```

---

## 🗄️ Base de Datos

### Modelos Principales

```prisma
Reservation       # Reservas de clientes
├── DishCategory  # Categorías del menú
├── Dish          # Platillos individuales
└── ReservationDish  # Platillos por reserva

RestaurantSettings  # Configuración global
BlockedDate         # Fechas bloqueadas
```

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear base de datos (DEV ONLY)
npx prisma migrate reset
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (próximamente)
npm run test:e2e
```

---

## 🚢 Deployment

### Railway (Actual)

El proyecto está configurado para despliegue automático en Railway:

- **Frontend**: https://front-restaurant-booking-production.up.railway.app
- **Backend**: https://backend-restaurant-booking-production.up.railway.app
- **Base de Datos**: PostgreSQL en Railway

### Docker Hub (Próximamente)

Imágenes pre-construidas estarán disponibles en:
- `gamr11/restaurant-booking-frontend:latest`
- `gamr11/restaurant-booking-backend:latest`

### Deploy Manual

```bash
# Build de producción
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

### Proceso

1. Fork el proyecto
2. Crea tu rama de feature
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit tus cambios
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```
4. Push a la rama
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Abre un Pull Request


## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**GAMR11**

- GitHub: [@GAMR11](https://github.com/GAMR11)
- LinkedIn: [Tu LinkedIn](https://www.linkedin.com/in/gustavo-morales-640259221/)
- Email: gamr130898@gmail.com

---

## 🙏 Agradecimientos

- [Prisma](https://www.prisma.io/) por el excelente ORM
- [Railway](https://railway.app/) por el hosting gratuito
- [Unsplash](https://unsplash.com/) por las imágenes de los platillos
- Comunidad de React y Node.js

---

## 📊 Stats

![GitHub repo size](https://img.shields.io/github/repo-size/GAMR11/restaurant-booking)
![GitHub stars](https://img.shields.io/github/stars/GAMR11/restaurant-booking?style=social)
![GitHub forks](https://img.shields.io/github/forks/GAMR11/restaurant-booking?style=social)
![GitHub issues](https://img.shields.io/github/issues/GAMR11/restaurant-booking)

---

<div align="center">
  <p>⭐ Si te gustó este proyecto, dale una estrella en GitHub ⭐</p>
  <p>Hecho con ❤️ por GAMR11</p>
</div>