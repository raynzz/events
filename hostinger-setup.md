# Configuración para Hostinger Easy Panel

## Problema Actual

El error principal que estás enfrentando es que Hostinger Easy Panel está usando Node.js 18.20.8, pero Next.js 16 requiere Node.js versión >=20.9.0.

## Solución

### 1. Dockerfile Optimizado para Hostinger

He actualizado el Dockerfile para usar Node.js 20 que es compatible con Next.js 16 y más estable en Hostinger.

### 2. Pasos para Desplegar en Hostinger

#### Opción A: Usar el script de despliegue (Recomendado)

```bash
# 1. Dar permisos de ejecución al script
chmod +x deploy-hostinger.sh

# 2. Construir la imagen Docker
./deploy-hostinger.sh build

# 3. Iniciar el contenedor
./deploy-hostinger.sh start

# 4. Ver los logs
./deploy-hostinger.sh logs
```

#### Opción B: Despliegue Manual en Hostinger Easy Panel

1. **Sube los archivos a tu repositorio Git**
2. **En el panel de Hostinger:**
   - Ve a la sección de aplicaciones
   - Selecciona tu aplicación
   - En la configuración de Docker, asegúrate de que esté usando Node.js 20

### 3. Variables de Entorno en Hostinger

Asegúrate de configurar estas variables de entorno en el panel de Hostinger:

```env
DIRECTUS_URL=https://rayner-seguros.6vlrrp.easypanel.host
DIRECTUS_TOKEN=VVnbHPcI1S_BkjM7jG8xN7qXnLCq2O8V
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Verificación del Build

Si el build falla, ejecuta estos comandos para verificar:

```bash
# Verificar la versión de Node.js
node --version

# Instalar dependencias
npm install

# Construir la aplicación
npm run build
```

### 5. Solución de Problemas Comunes

#### Error: "You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required."

Esto significa que Hostinger está usando una imagen base incorrecta. Asegúrate de:

1. En el panel de Hostinger, selecciona la opción "Node.js 20" o superior
2. Si el problema persiste, contacta soporte de Hostinger para que actualicen la imagen base

#### Error de Docker Build

Si el Docker build falla, verifica:

1. Que todos los archivos estén en el repositorio
2. Que el Dockerfile esté en la raíz del proyecto
3. Que las variables de entorno estén configuradas correctamente

### 6. Prueba Local

Antes de desplegar, puedes probar la aplicación localmente:

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Accede a `http://localhost:3000` para verificar que funciona correctamente.

### 7. Despliegue Final

Una vez que todo esté funcionando localmente:

1. **Sube a Git:**
   ```bash
   git add .
   git commit -m "Fix: Actualizar Dockerfile para Node.js 20"
   git push origin main
   ```

2. **En Hostinger:**
   - El panel de Hostinger debería detectar los cambios y reconstruir automáticamente
   - Si no, puedes forzar el rebuild desde el panel de control

3. **Verifica el acceso:**
   - Accede a `https://rayner-hop.6vlrrp.easypanel.host`
   - Prueba el sistema de autenticación

### 8. Optimizaciones para Producción

He añadido estas optimizaciones al Dockerfile:

- Node.js 20 en lugar de 22 (máxima compatibilidad)
- Variables de entorno optimizadas
- Configuración de producción
- Manejo adecuado de permisos

### 9. Monitoreo

Una vez desplegado, monitorea:

- Los logs del contenedor: `./deploy-hostinger.sh logs`
- El uso de recursos en el panel de Hostinger
- El rendimiento de la aplicación

### 10. Contacto con Soporte

Si el problema persiste, contacta a Hostinger soporte y menciona:

- Necesitas Node.js 20+ para Next.js 16
- El Dockerfile está configurado correctamente
- El build falla debido a la versión de Node.js

---

¡Tu aplicación debería estar funcionando correctamente ahora con esta configuración optimizada para Hostinger!