# syntax=docker/dockerfile:1

FROM node:22.22.0-alpine AS base
WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copia el resto
COPY . .

# =========================
# DEV (Vite)
# =========================
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# =========================
# BUILD (Vite -> dist)
# =========================
FROM base AS build
RUN npm run build

# =========================
# PROD (Nginx)
# =========================
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
