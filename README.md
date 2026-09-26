# Harinas Don Pepito — Catálogo web + Panel admin

Aplicación React que sirve dos superficies desde el mismo bundle:

- **Catálogo público**: listado y detalle de productos/categorías, con una
  "lista de interés" que se envía por WhatsApp (no hay carrito de compra ni
  checkout real).
- **Panel admin** (`/admin`): CRUD de productos y categorías, con un
  dashboard de métricas.

## Stack

React 18 + Vite 7 + React Router 7 + TanStack React Query 5 + Axios +
Tailwind 4 + React Hook Form + Zod. Pruebas con Vitest + React Testing
Library.

## Requisitos

- Node.js 20+ y npm.

## Instalación

```bash
npm ci
cp .env.example .env   # y completa los valores (ver abajo)
npm run dev
```

## Backend local (opcional, para desarrollo end-to-end)

Existe un backend Node.js/Express real en `backend/`, respaldado por una
copia local en MySQL/MariaDB restaurada del dump de producción — ver
`backend/README.md` para restaurar la base y levantarlo. Para apuntar el
frontend a él en desarrollo:

```bash
# .env.local (no se commitea)
VITE_API_BASE_URL=http://localhost:4000/api
VITE_IMAGES_BASE_URL=http://localhost:4000/images
VITE_IMAGE_UPLOAD_URL=https://api-centralizador.apiworking.pe/api/Data/images
VITE_BD_NAME=don_pepito_web
VITE_WHATSAPP_PHONE=946762926
```

Sin este backend, el frontend sigue apuntando por defecto a la API de
producción (`VITE_API_BASE_URL` por defecto en `src/config/env.js`).

## Variables de entorno

Toda variable `VITE_*` se expone al bundle del navegador — nunca pongas
secretos ahí. Se leen en `src/config/env.js` con defaults de desarrollo si
faltan.

| Variable                 | Uso                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL`      | Base de la API (`/Card/login`, `/MicroSaas/*`).                   |
| `VITE_IMAGES_BASE_URL`   | Base para servir imágenes cuando exista una nueva fuente.         |
| `VITE_IMAGE_UPLOAD_URL`  | Endpoint multipart de subida; las imágenes deben ser menores a 2 MB. |
| `VITE_BD_NAME`           | Nombre de la base de datos que se inyecta como `?bd=` en el API.  |
| `VITE_WHATSAPP_PHONE`    | Teléfono usado en los links de WhatsApp del sitio público.        |

## Comandos

```bash
npm run dev            # servidor de desarrollo
npm run build          # build de producción a dist/
npm run preview        # sirve el build localmente
npm run lint           # ESLint (0 errores/warnings es el estado esperado)
npm run test           # Vitest en modo run
npm run test:watch     # Vitest en modo watch
npm run test:coverage  # Vitest con reporte de cobertura
```

## Docker

```bash
cp .env.example .env   # docker-compose sustituye ${VITE_*} desde este archivo
docker compose up --build
```

Las variables `VITE_*` se "hornean" en el JavaScript en **build time**, no en
runtime — por eso `docker-compose.yml` las pasa como `build.args` al
`Dockerfile`. Si cambias una variable, hay que reconstruir la imagen.

`docker-compose.yml` solo levanta el frontend (pensado para producción,
apuntando a la API real). Para un stack local completo (MySQL + backend +
frontend) usa `docker-compose.local.yml` — ver `backend/README.md`.

## Arquitectura (resumen)

```
src/
  components/      UI compartida (PublicLayout, modales admin, AppImage, etc.)
  pages/            páginas públicas y páginas admin (pages/admin)
  routes/           AppRouter (rutas + code-splitting) y ProtectedRoute
  services/         axios client, servicios por entidad, queryKeys.js
  utils/            apiNormalizers.js (fuente única de verdad de shapes de datos)
  state/            auth.js (sesión en localStorage)
  config/           env.js (variables de entorno) y publicSiteConfig.js (marca/contacto)
```

- **Normalización de datos**: `src/utils/apiNormalizers.js` es la única
  fuente para convertir lo que devuelve el API (booleans como `0`/`1`/`"0"`/
  `"1"`, camelCase vs snake_case) a un shape consistente. Los servicios
  (`productsService.js`, `categoriesService.js`) normalizan las respuestas
  de lectura y construyen el body de escritura con `toProductApiBody` /
  `toCategoryApiBody`.
- **Cache de React Query**: `src/services/queryKeys.js` centraliza las
  keys (`["products", bd]`, `["categories", bd]`). Admin y sitio público
  comparten la misma key por entidad, así que una mutación en el panel
  invalida también lo que ve el catálogo público.
- **Imágenes resistentes**: `src/components/AppImage.jsx` reemplaza
  `<img>` en productos, categorías, banners, logo, QR y ayuda. Si la URL
  externa falla, cambia una vez a un fallback local (`public/*.png|svg`) y
  nunca deja el ícono roto del navegador.

## Endpoints esperados del backend

- `POST /Card/login`
- `GET|POST|PUT|DELETE /MicroSaas/products`
- `GET|POST|PUT|DELETE /MicroSaas/categories`
- `POST /Data/images`

## Limitación de seguridad conocida (frontend-only)

`ProtectedRoute` y el guard de `/admin` solo evitan que la *interfaz* se
muestre sin sesión — **no protegen los datos**. La protección real depende
de que el backend exija autenticación en cada endpoint.

Estado actual:

- Si el backend devuelve un `token` en el login, `Login.jsx` lo persiste
  (`setToken`) y `apiClient.js` manda `Authorization: Bearer <token>` en
  cada request. El backend local en `backend/` ya hace esto con JWT real.
- Si el backend no devuelve token (API legada), el frontend sigue
  funcionando solo con el guard visual de sesión — nunca se inventa un
  token falso.
- Un 401 del backend limpia la sesión local automáticamente
  (`handleResponseError` en `src/services/apiClient.js`).

**La protección real vive en el backend**: solo protege lo que cada
endpoint de `/MicroSaas/*` y `/Data/images` valide por su cuenta.

## Imágenes caídas y cómo restaurarlas

Varias fotografías de producto/categoría y recursos de marca (logo, banner,
QR, botón de ayuda) apuntan a
`https://api-centralizador.apiworking.pe/images/...`, que actualmente
devuelve 404 para varios archivos. Mientras eso no se resuelva:

- El logo y el botón de ayuda caen a `public/logo_don_pepito.png` y
  `public/do_u_need_help.png`.
- Productos, categorías y banners caen a los placeholders SVG en `public/
  placeholder-*.svg`.
- No se inventó ninguna foto de producto nueva.

Para recuperar las imágenes reales hace falta una de estas dos cosas por
parte del negocio/backend:

1. Una nueva URL base de imágenes (configurable ya vía
   `VITE_IMAGES_BASE_URL`), o
2. Los archivos fuente originales para subirlos de nuevo al `/Data/images`
   actual.

## Riesgos / pendientes

- Con la API de producción (sin el backend local): autenticación real por
  token y autorización por endpoint siguen pendientes de ese lado.
- Recuperar o re-alojar las imágenes de `api-centralizador.apiworking.pe`
  que devuelven 404 — ver `backend/reports/` para el detalle por dominio.
- El backend local no tiene roles (admin/editor); cualquier usuario
  autenticado puede hacer cualquier mutación.
