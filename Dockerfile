# Usar una imagen base ligera de Nginx Alpine
FROM nginx:alpine

# Eliminar el archivo de configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Crear un archivo de configuración personalizado para Nginx
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root   /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        index  index.html index.htm;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    error_page   500 502 503 504  /50x.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location = /50x.html {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root   /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Copiar los archivos de tu aplicación al directorio de trabajo de Nginx
COPY . /usr/share/nginx/html/

# Exponer el puerto 80 para el acceso externo
EXPOSE 80

# Iniciar Nginx cuando el contenedor se inicie
CMD ["nginx", "-g", "daemon off;"]