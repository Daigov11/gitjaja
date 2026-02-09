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
