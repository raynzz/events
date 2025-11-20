# Mi Aplicación Next.js con Directus

Aplicación web construida con Next.js 16 y TypeScript, integrada con Directus para la autenticación y gestión de datos.

## Características

- ✅ Next.js 16 con TypeScript
- ✅ Tailwind CSS para el diseño
- ✅ Autenticación con Directus
- ✅ Sistema de rutas protegidas con middleware
- ✅ Manejo de sesiones y tokens
- ✅ Docker para el despliegue
- ✅ Formularios de login y registro con validación
- ✅ Dashboard de usuario

## Tecnologías Utilizadas

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Autenticación**: Directus SDK
- **Formularios**: React Hook Form con Zod para validación
- **Diseño**: Tailwind CSS con componentes personalizados
- **Despliegue**: Docker

## Estructura del Proyecto

```
├── app/                    # Rutas de Next.js App Router
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal/dashboard
├── components/            # Componentes de React
│   ├── LoginForm.tsx      # Formulario de inicio de sesión
│   └── RegisterForm.tsx   # Formulario de registro
├── contexts/              # Contextos de React
│   └── AuthContext.tsx    # Contexto de autenticación
├── lib/                   # Utilidades y configuraciones
│   ├── directus.ts        # Configuración de Directus
│   └── useSession.ts      # Hook para manejar sesiones
├── Dockerfile             # Configuración de Docker
├── .dockerignore          # Archivos a ignorar en Docker
├── deploy.sh             # Script de despliegue
└── README.md             # Este archivo
```

## Configuración de Directus

La aplicación está configurada para usar tu instancia de Directus:

- **URL**: `https://rayner-seguros.6vlrrp.easypanel.host`
- **Token**: `VVnbHPcI1S_BkjM7jG8xN7qXnLCq2O8V`

Estas configuraciones se encuentran en el archivo `.env.local`.

## Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Directus
DIRECTUS_URL=https://rayner-seguros.6vlrrp.easypanel.host
DIRECTUS_TOKEN=VVnbHPcI1S_BkjM7jG8xN7qXnLCq2O8V

# Configuración de Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd <directorio-del-proyecto>
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.local.example` a `.env.local` y configura las variables necesarias.

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### 5. Ejecutar en modo producción

```bash
npm run build
npm start
```

## Despliegue con Docker

### 1. Construir la imagen Docker

```bash
./deploy.sh build
```

### 2. Iniciar la aplicación en producción

```bash
./deploy.sh start
```

### 3. Ver los logs

```bash
./deploy.sh logs
```

### 4. Detener la aplicación

```bash
./deploy.sh stop
```

### 5. Limpiar (eliminar contenedor e imagen)

```bash
./deploy.sh clean
```

### 6. Subir a Docker Hub

```bash
# Primero, inicia sesión en Docker Hub
docker login

# Luego sube la imagen
./deploy.sh push
```

## Despliegue en VPS de Hostinger

### Opción A: Usar Docker directamente en tu VPS

1. Sube los archivos de tu proyecto al VPS
2. Instala Docker en tu VPS
3. Ejecuta los comandos de despliegue:
   ```bash
   ./deploy.sh build
   ./deploy.sh start
   ```

### Opción B: Usar Docker Hub

1. Sube tu imagen a Docker Hub:
   ```bash
   ./deploy.sh push
   ```
2. En tu VPS, descarga e inicia la imagen:
   ```bash
   docker pull tu-usuario/mi-aplicacion-next:latest
   docker run -d -p 3000:3000 --name mi-app-next tu-usuario/mi-aplicacion-next:latest
   ```

## Características de Autenticación

### Login
- Formulario de inicio de sesión con email y contraseña
- Validación con React Hook Form y Zod
- Manejo de errores y estados de carga
- Redirección automática al dashboard

### Registro
- Formulario de registro con email, contraseña y datos personales
- Validación de contraseñas
- Registro automático y login posterior
- Redirección al dashboard

### Sesiones
- Manejo de tokens de acceso y refresh
- Almacenamiento seguro en localStorage
- Verificación automática de sesión expirada
- Refrescamiento automático de tokens

### Rutas Protegidas
- Middleware para proteger rutas
- Redirección automática al login si no está autenticado
- Mantenimiento de la URL de destino

## Endpoints de Directus

La aplicación utiliza los siguientes endpoints de Directus:

- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/refresh` - Refrescar token
- `GET /users/me` - Obtener usuario actual
- `PATCH /users/me` - Actualizar usuario actual

## Personalización

### Modificar la URL de Directus

1. Abre el archivo `lib/directus.ts`
2. Modifica la variable `directusUrl` con tu nueva URL

### Agregar nuevas rutas protegidas

1. Asegúrate de que la ruta no esté en la lista de rutas públicas en `middleware.ts`
2. El middleware se encargará automáticamente de protegerla

### Personalizar el diseño

1. Modifica los archivos en `app/` para cambiar el layout
2. Usa Tailwind CSS para estilizar los componentes
3. Los componentes de formulario están en `components/`

## Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

## Licencia

MIT License - ver el archivo LICENSE para más detalles.
