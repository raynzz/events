#!/bin/bash

# Script de despliegue para Docker en Hostinger Easy Panel
set -e

# Configuración
IMAGE_NAME="mi-aplicacion-next"
IMAGE_TAG="latest"
CONTAINER_NAME="mi-app-next"
PORT=3000

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para construir la imagen Docker
build_image() {
    log "Construyendo imagen Docker para Hostinger..."
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    log "Imagen construida: ${IMAGE_NAME}:${IMAGE_TAG}"
}

# Función para iniciar el contenedor
start_container() {
    log "Iniciando contenedor para Hostinger..."
    
    # Detener contenedor existente si existe
    if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
        log "Deteniendo contenedor existente..."
        docker stop ${CONTAINER_NAME}
    fi
    
    # Eliminar contenedor existente
    if docker ps -aq -f name=${CONTAINER_NAME} | grep -q .; then
        log "Eliminando contenedor existente..."
        docker rm ${CONTAINER_NAME}
    fi
    
    # Iniciar nuevo contenedor con configuración para Hostinger
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:3000 \
        --restart unless-stopped \
        -e NODE_ENV=production \
        -e NEXT_TELEMETRY_DISABLED=1 \
        ${IMAGE_NAME}:${IMAGE_TAG}
    
    log "Contenedor iniciado: ${CONTAINER_NAME}"
    log "Accede a la aplicación en: https://rayner-hop.6vlrrp.easypanel.host"
}

# Función para detener el contenedor
stop_container() {
    log "Deteniendo contenedor..."
    docker stop ${CONTAINER_NAME}
    log "Contenedor detenido: ${CONTAINER_NAME}"
}

# Función para ver los logs
logs() {
    log "Mostrando logs del contenedor..."
    docker logs -f ${CONTAINER_NAME}
}

# Función para limpiar (eliminar contenedor e imagen)
clean() {
    log "Limpiando contenedor e imagen..."
    
    # Detener y eliminar contenedor
    if docker ps -aq -f name=${CONTAINER_NAME} | grep -q .; then
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
        log "Contenedor eliminado: ${CONTAINER_NAME}"
    fi
    
    # Eliminar imagen
    if docker images -q ${IMAGE_NAME}:${IMAGE_TAG} | grep -q .; then
        docker rmi ${IMAGE_NAME}:${IMAGE_TAG}
        log "Imagen eliminada: ${IMAGE_NAME}:${IMAGE_TAG}"
    fi
    
    log "Limpieza completada"
}

# Función para probar la aplicación localmente
test_local() {
    log "Probando aplicación localmente..."
    
    # Instalar dependencias
    npm install
    
    # Construir la aplicación
    npm run build
    
    # Iniciar la aplicación en modo desarrollo
    log "Iniciando aplicación en modo desarrollo..."
    log "Accede a la aplicación en: http://localhost:3000"
    npm run dev
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 {build|start|stop|logs|clean|test|help}"
    echo ""
    echo "Comandos disponibles:"
    echo "  build    - Construir la imagen Docker"
    echo "  start    - Iniciar el contenedor"
    echo "  stop     - Detener el contenedor"
    echo "  logs     - Ver los logs del contenedor"
    echo "  clean    - Limpiar (eliminar contenedor e imagen)"
    echo "  test     - Probar aplicación localmente"
    echo "  help     - Mostrar este mensaje de ayuda"
}

# Parseo de argumentos
case "$1" in
    build)
        build_image
        ;;
    start)
        start_container
        ;;
    stop)
        stop_container
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    test)
        test_local
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac