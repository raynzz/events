# Página de Prueba Docker

Este es un proyecto simple de página web estática que se puede desplegar usando Docker.

## Archivos del Proyecto

- `index.html` - Página principal de la aplicación
- `Dockerfile` - Configuración para construir la imagen Docker
- `.dockerignore` - Archivos que se deben ignorar al construir la imagen Docker

## Pasos para Subir a Git

### 1. Inicializar el repositorio Git

```bash
git init
```

### 2. Agregar los archivos al repositorio

```bash
git add .
```

### 3. Hacer el primer commit

```bash
git commit -m "Página de prueba inicial con Docker"
```

### 4. Conectar con tu repositorio remoto (reemplaza con tu URL de Git)

```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
```

### 5. Subir los archivos a Git

```bash
git push -u origin main
```

## Pasos para Construir y Desplegar con Docker

### 1. Construir la imagen Docker

```bash
docker build -t mi-pagina-prueba .
```

### 2. (Opcional) Subir la imagen a Docker Hub

Si deseas usar Docker Hub como intermediario:

```bash
# Etiquetar la imagen
docker tag mi-pagina-prueba tu-usuario/mi-pagina-prueba:latest

# Iniciar sesión en Docker Hub
docker login

# Subir la imagen
docker push tu-usuario/mi-pagina-prueba:latest
```

### 3. Desplegar en VPS de Hostinger

#### Opción A: Usar Docker Hub

En tu VPS de Hostinger:

```bash
# Descargar la imagen desde Docker Hub
docker pull tu-usuario/mi-pagina-prueba:latest

# Ejecutar el contenedor
docker run -d -p 8080:80 --name mi-pagina tu-usuario/mi-pagina-prueba:latest
```

#### Opción B: Construir directamente en el VPS

Clona el repositorio en tu VPS y construye la imagen allí:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

# Construir la imagen
docker build -t mi-pagina-prueba .

# Ejecutar el contenedor
docker run -d -p 8080:80 --name mi-pagina mi-pagina-prueba
```

## Acceder a la Página

Una vez que el contenedor esté en ejecución, puedes acceder a tu página web en:

- `http://localhost:8080` (si estás en el mismo servidor)
- `http://tu-vps-ip:8080` (desde cualquier lugar)

## Comandos Útiles

### Ver contenedores en ejecución

```bash
docker ps
```

### Ver logs del contenedor

```bash
docker logs mi-pagina
```

### Detener un contenedor

```bash
docker stop mi-pagina
```

### Iniciar un contenedor detenido

```bash
docker start mi-pagina
```

### Eliminar un contenedor

```bash
docker rm mi-pagina
```

### Eliminar una imagen

```bash
docker rmi mi-pagina-prueba
```

## Configuración de Hostinger

Si usas Hostinger, asegúrate de:

1. **Abrir el puerto 8080** en el firewall de tu VPS
2. **Configurar el dominio** para que apunte a tu IP de VPS
3. **Configurar proxy inverso** (si usas HTTPS) para redirigir el tráfico

## Notas Adicionales

- La imagen se basa en Nginx Alpine, que es muy ligera
- El contenedor expone el puerto 80 internamente y lo mapea al puerto 8080 de tu host
- Puedes cambiar el puerto de mapeo modificando el flag `-p` en el comando `docker run`

## Personalización

Para personalizar la página:

1. Edita el archivo `index.html`
2. Vuelve a construir la imagen con `docker build -t mi-pagina-prueba .`
3. Detén y elimina el contenedor antiguo, luego inicia uno nuevo