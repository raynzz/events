#!/bin/bash

# Script de ayuda para desplegar la aplicación Next.js con Directus
# Uso: ./deploy.sh [build|dev|start|stop|logs|clean]

# Variables de configuración
IMAGE_NAME="mi-aplicacion-next"
CONTAINER_NAME="mi-app-next"
PORT_MAPPING="3000:3000"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build    Construir la imagen Docker"
    echo "  dev      Iniciar la aplicación en modo desarrollo"
    echo "  start    Iniciar la aplicación en producción"
    echo "  stop     Detener la aplicación"
    echo "  logs     Ver los logs del contenedor"
    echo "  clean    Eliminar el contenedor y la imagen"
    echo "  push     Subir la imagen a Docker Hub (requiere login previo)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build          # Construir la imagen"
    echo "  $0 dev            # Iniciar en modo desarrollo"
    echo "  $0 start          # Iniciar en producción"
    echo "  $0 stop           # Detener la aplicación"
    echo "  $0 logs           # Ver los logs"
    echo "  $0 clean          # Limpiar contenedor e imagen"
    echo "  $0 push           # Subir a Docker Hub"
}

# Función para construir la imagen
build_image() {
    echo "🏗️  Construyendo la imagen Docker..."
    docker build -t $IMAGE_NAME .
    if [ $? -eq 0 ]; then
        echo "✅ Imagen construida exitosamente: $IMAGE_NAME"
    else
        echo "❌ Error al construir la imagen"
        exit 1
    fi
}

# Función para iniciar en modo desarrollo
dev_mode() {
    echo "🚀 Iniciando la aplicación en modo desarrollo..."
    docker run -p $PORT_MAPPING --name $CONTAINER_NAME -it $IMAGE_NAME npm run dev
}

# Función para iniciar en producción
start_prod() {
    echo "🚀 Iniciando la aplicación en producción..."
    
    # Detener y eliminar el contenedor si ya existe
    if docker ps -a --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        echo "⚠️  Contenedor existente encontrado, eliminándolo..."
        docker stop $CONTAINER_NAME >/dev/null 2>&1
        docker rm $CONTAINER_NAME >/dev/null 2>&1
    fi
    
    # Ejecutar el nuevo contenedor
    docker run -d -p $PORT_MAPPING --name $CONTAINER_NAME $IMAGE_NAME
    
    if [ $? -eq 0 ]; then
        echo "✅ Aplicación iniciada exitosamente"
        echo "🌐 Puedes acceder a tu aplicación en: http://localhost:$PORT_MAPPING"
        echo "   o desde fuera: http://$(curl -s ifconfig.me):$PORT_MAPPING"
    else
        echo "❌ Error al iniciar la aplicación"
        exit 1
    fi
}

# Función para detener la aplicación
stop_app() {
    echo "🛑 Deteniendo la aplicación..."
    docker stop $CONTAINER_NAME
    if [ $? -eq 0 ]; then
        echo "✅ Aplicación detenida exitosamente"
    else
        echo "❌ Error al detener la aplicación"
    fi
}

# Función para ver los logs
show_logs() {
    echo "📋 Mostrando logs de la aplicación..."
    docker logs -f $CONTAINER_NAME
}

# Función para limpiar
clean_all() {
    echo "🧹 Limpiando contenedor e imagen..."
    
    # Detener y eliminar el contenedor si está en ejecución
    if docker ps -a --format "table {{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
        echo "Eliminando contenedor..."
        docker stop $CONTAINER_NAME >/dev/null 2>&1
        docker rm $CONTAINER_NAME >/dev/null 2>&1
    fi
    
    # Eliminar la imagen
    if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "^$IMAGE_NAME:latest$"; then
        echo "Eliminando imagen..."
        docker rmi $IMAGE_NAME >/dev/null 2>&1
    fi
    
    echo "✅ Limpieza completada"
}

# Función para subir a Docker Hub
push_to_dockerhub() {
    echo "📤 Subiendo imagen a Docker Hub..."
    
    # Verificar si el usuario ha iniciado sesión
    if ! docker info | grep -q "Username"; then
        echo "❌ No has iniciado sesión en Docker Hub"
        echo "Por favor ejecuta: docker login"
        exit 1
    fi
    
    # Etiquetar la imagen
    echo "🏷️  Etiquetando la imagen..."
    docker tag $IMAGE_NAME tu-usuario/$IMAGE_NAME:latest
    
    # Subir la imagen
    docker push tu-usuario/$IMAGE_NAME:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Imagen subida exitosamente a Docker Hub"
        echo "   tu-usuario/$IMAGE_NAME:latest"
    else
        echo "❌ Error al subir la imagen"
        exit 1
    fi
}

# Manejo de argumentos
case "$1" in
    build)
        build_image
        ;;
    dev)
        dev_mode
        ;;
    start)
        start_prod
        ;;
    stop)
        stop_app
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_all
        ;;
    push)
        push_to_dockerhub
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Comando no reconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac