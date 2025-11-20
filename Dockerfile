# Usar una imagen base compatible con Hostinger
FROM node:20-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Ver https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para información sobre libc6-compat
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basado en el tipo de archivo de bloqueo
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild la fuente de la aplicación solo cuando cambie el código fuente
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configuración para Next.js 16
ENV NEXT_TELEMETRY_DISABLED=1

# Generar la aplicación Next.js
RUN npm run build

# Imagen de producción que contiene la aplicación y es optimizada para el despliegue
FROM base AS runner
WORKDIR /app

# Formato moderno: ENV KEY=value (evita warnings)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario y grupo para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Configurar automáticamente las variables de entorno para las claves de API en el entorno de producción
# Lea más aquí: https://nextjs.org/docs/advanced-features/output-file-tracing#manual-tracing
ARG NEXT_PUBLIC_DIRECTUS_URL
ENV NEXT_PUBLIC_DIRECTUS_URL=${NEXT_PUBLIC_DIRECTUS_URL:-https://rayner-seguros.6vlrrp.easypanel.host}

# Copiar los archivos de la aplicación construida
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exponer el puerto y configurar variables de entorno
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Correr la aplicación con el usuario nextjs
CMD ["node", "server.js"]
