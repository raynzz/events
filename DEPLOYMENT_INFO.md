# Configuración para Despliegue

## Datos de Directus Necesarios

### Entorno de Desarrollo (Local)
Ya configurado en `.env.local`:
- **URL**: `https://rayner-seguros.6vlrrp.easypanel.host`
- **Token**: `0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu`

### Credenciales de Usuario para Pruebas
- **Admin**: `admin` / `admin`
- **Usuario**: `raynerteran.ar@gmail.com` / `Holachao123.`

## Variables de Entorno

### Archivo `.env.local` (Desarrollo)
```env
# Configuración de Directus
DIRECTUS_URL=https://rayner-seguros.6vlrrp.easypanel.host
DIRECTUS_TOKEN=0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu

# Configuración de la aplicación (opcional)
NEXT_PUBLIC_APP_NAME=Events Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Archivo `.env.production` (Producción)
Para producción, debes crear este archivo con:
```env
# Configuración de Directus
DIRECTUS_URL=https://tu-directus-url.com
DIRECTUS_TOKEN=tu-token-de-directus

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Events Platform
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## Pasos para Despliegue

### 1. Configurar Directus en Producción
1. Asegúrate de que tu instancia de Directus esté corriendo
2. Genera un token de API con los permisos necesarios
3. Actualiza la URL y el token en el archivo `.env.production`

### 2. Configurar el Frontend
1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Construir la aplicación:
   ```bash
   npm run build
   ```

3. Iniciar la aplicación:
   ```bash
   npm start
   ```

### 3. Verificación
1. Accede a la aplicación en tu navegador
2. Intenta iniciar sesión con las credenciales de prueba
3. Verifica que el dashboard se carga correctamente

## Archivos Modificados

### Configuración Directus
- `lib/directus.ts`: Actualizado con el nuevo token
- `.env.local`: Variables de entorno para desarrollo

### Páginas Creadas
- `app/home/page.tsx`: Página de inicio pública
- `app/dashboard/page.tsx`: Dashboard de usuario
- `app/page.tsx`: Página principal redirige según estado de autenticación

## Notas Importantes

1. **Seguridad**: Nunca commits el archivo `.env.local` a tu repositorio
2. **Tokens**: El token de Directus tiene acceso completo a la API, guárdalo de forma segura
3. **URLs**: Asegúrate de que las URLs en producción usen HTTPS
4. **Permisos**: Verifica que el token tenga los permisos necesarios para las operaciones que requieras

## Pruebas Realizadas

- ✅ Configuración de Directus actualizada
- ✅ Variables de entorno configuradas
- ✅ Servidor de desarrollo corriendo en `http://localhost:3000`
- ✅ Página de inicio accesible
- ✅ Dashboard accesible con autenticación
- ✅ Sistema de login funcional