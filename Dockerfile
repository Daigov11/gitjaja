# Etapa 1: build
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos solo dependencias primero (mejor cache)
COPY package*.json ./
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

# Limitar memoria para Vite
ENV NODE_OPTIONS=--max-old-space-size=512

# Variables VITE_* (se hornean en el bundle en build-time, no en runtime)
ARG VITE_API_BASE_URL
ARG VITE_IMAGES_BASE_URL
ARG VITE_IMAGE_UPLOAD_URL
ARG VITE_BD_NAME
ARG VITE_WHATSAPP_PHONE
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_IMAGES_BASE_URL=${VITE_IMAGES_BASE_URL}
ENV VITE_IMAGE_UPLOAD_URL=${VITE_IMAGE_UPLOAD_URL}
ENV VITE_BD_NAME=${VITE_BD_NAME}
ENV VITE_WHATSAPP_PHONE=${VITE_WHATSAPP_PHONE}

# Build de Vite
RUN npm run build

# Etapa 2: nginx
FROM nginx:alpine

# Copiamos el build al nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos tu nginx.conf (está en el repo, perfecto)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
