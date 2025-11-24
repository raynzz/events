#!/bin/bash

# Script para probar la solución de despliegue localmente
# Uso: ./test-deployment.sh

echo "🔍 Iniciando pruebas de despliegue local..."

# 1. Verificar que el archivo .env.production existe
if [ ! -f ".env.production" ]; then
    echo "❌ Error: El archivo .env.production no existe"
    exit 1
fi

echo "✅ Archivo .env.production encontrado"

# 2. Verificar que las URLs en el Dockerfile son correctas
if grep -q "rayner-hop.6vlrrp.easypanel.host" Dockerfile; then
    echo "✅ URL en Dockerfile es correcta (rayner-hop)"
else
    echo "❌ Error: URL en Dockerfile no es correcta"
    exit 1
fi

# 3. Verificar que el middleware está configurado correctamente
if grep -q "publicPaths.*\['/login'" middleware.ts && grep -q "publicPaths.*\['/dashboard'" middleware.ts; then
    echo "✅ Middleware configurado correctamente"
else
    echo "❌ Error: Middleware no está configurado correctamente"
    exit 1
fi

# 4. Verificar que el archivo .env.production tiene las URLs correctas
if grep -q "rayner-hop.6vlrrp.easypanel.host" .env.production; then
    echo "✅ URLs en .env.production son correctas"
else
    echo "❌ Error: URLs en .env.production no son correctas"
    exit 1
fi

# 5. Intentar construir la aplicación localmente
echo "🏗️  Intentando construir la aplicación localmente..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Construcción local exitosa"
else
    echo "❌ Error en la construcción local"
    exit 1
fi

# 6. Verificar que el Dockerfile se puede construir
echo "🐳 Intentando construir el Dockerfile..."
docker build -t test-events-app .

if [ $? -eq 0 ]; then
    echo "✅ Dockerfile construido exitosamente"
else
    echo "❌ Error al construir el Dockerfile"
    exit 1
fi

echo "🎉 Todas las pruebas pasaron! La solución está lista para el despliegue."
echo ""
echo "Pasos para el despliegue en Easy Panel:"
echo "1. Haz commit de los cambios"
echo "2. Empuja a tu repositorio de Git"
echo "3. En Easy Panel, conecta tu repositorio"
echo "4. Asegúrate de que las variables de entorno estén configuradas:"
echo "   - NEXT_PUBLIC_DIRECTUS_URL=https://rayner-hop.6vlrrp.easypanel.host"
echo "   - DIRECTUS_URL=https://rayner-hop.6vlrrp.easypanel.host"
echo "   - DIRECTUS_TOKEN=0bGJAHZnl24NIQ4l8v_BUcFXhBKAikwu"
echo "   - NODE_ENV=production"