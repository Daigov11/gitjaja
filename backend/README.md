# Don Pepito — Backend local

API Node.js/Express compatible con el frontend existente, respaldada por una
copia local en MySQL/MariaDB restaurada del dump de producción.

## Stack

Express 4 + mysql2/promise + zod + bcrypt + jsonwebtoken + multer + helmet +
express-rate-limit. Pruebas con Vitest + Supertest (contra la base local real,
no mocks).

## 1. Restaurar el dump localmente

**Nunca se modifica el dump original.** Se restaura en una base nueva y
aislada (`don_pepito_web_local`), nunca en `don_pepito_web` ni en ninguna
base ya existente.

```bash
mysql --version
mysql -u <tu_usuario_admin> -e "SELECT VERSION();"

mysql -u <tu_usuario_admin> -e "
  CREATE DATABASE IF NOT EXISTS don_pepito_web_local
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
"

# El dump NO trae CREATE DATABASE/USE, así que se puede apuntar directo:
mysql -u <tu_usuario_admin> don_pepito_web_local < ../dump-don_pepito_web-*.sql
```

Verificar:

```sql
SHOW TABLES;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'don_pepito_web_local';
```

`information_schema.TABLE_ROWS` es una **estimación** de InnoDB — justo
después de restaurar puede mostrar números muy por debajo de lo real (visto
en pruebas: `ven_product` en 0 cuando en realidad tenía 727). Para el conteo
exacto usa `SELECT COUNT(*) FROM ven_product;` directamente.

### Tablas reales detectadas (no asumidas)

| Tabla           | Filas (dump de referencia) | Uso                                    |
| --------------- | --------------------------- | --------------------------------------- |
| `ven_product`    | 727                          | Catálogo de productos                   |
| `ven_category`   | 46                           | Categorías (FK desde `ven_product`)     |
| `mae_usuario`    | 2                            | Login (`usuario` + `contrasena` bcrypt) |
| `mae_infocard`   | 2                            | No usada por los endpoints actuales     |

`ven_product.id_category` tiene una FK real hacia `ven_category` con
`ON DELETE RESTRICT`: MySQL ya impide borrar una categoría con productos; el
backend además valida esto antes, para devolver un 409 con mensaje claro en
vez de un error genérico de base de datos.

### Crear un usuario de aplicación con privilegios mínimos

No uses tu usuario admin/root para correr el backend. Crea uno dedicado, solo
con permisos sobre `don_pepito_web_local`:

```sql
CREATE USER IF NOT EXISTS 'don_pepito_app'@'localhost' IDENTIFIED BY 'una-password-fuerte';
GRANT SELECT, INSERT, UPDATE, DELETE ON don_pepito_web_local.* TO 'don_pepito_app'@'localhost';
FLUSH PRIVILEGES;
```

Usa esas credenciales en `MYSQL_USER`/`MYSQL_PASSWORD` de tu `.env`.

### Migración del carrusel

El carrusel se guarda en una tabla propia y no altera productos ni categorías.
Ejecuta esta migración **una sola vez** con tu usuario administrador de MySQL
(el usuario de la aplicación conserva privilegios mínimos):

```bash
mysql -u <tu_usuario_admin> don_pepito_web_local \
  < migrations/001_create_web_carousel_slide.sql
```

Después podrás administrar los banners desde `/admin/carrusel`. Las imágenes
subidas se guardan en `uploads/` y el inicio usa los slides visibles ordenados
por su posición. Si aún no hay slides, conserva los banners heredados como
respaldo.

## 2. Configurar y correr

```bash
cp .env.example .env   # completa MYSQL_USER/PASSWORD, JWT_SECRET y LOCAL_DEV_PASSWORD
npm install
npm run seed:user      # crea un usuario de desarrollo (ver abajo)
npm run dev
```

## 3. Usuarios y autenticación

El dump trae 2 usuarios reales (`jrafael.apiworking@gmail.com`,
`admin@gmail.com`) con contraseñas **bcrypt** — no se pueden recuperar en
texto plano ni se intentó hacerlo. En vez de tocarlos, `npm run seed:user`
inserta un tercer usuario **solo para desarrollo local**, sin alterar los
2 originales.

Ese usuario no tiene ningún password hardcodeado en el código: se define en
tu `backend/.env` (nunca versionado):

```
LOCAL_DEV_USER=dev.local@donpepito.test   # opcional, tiene este default
LOCAL_DEV_PASSWORD=elige-tu-propia-clave-local
```

Sin `LOCAL_DEV_PASSWORD`, tanto `npm run seed:user` como los tests fallan con
un mensaje explicando qué falta — no hay una contraseña de ejemplo que
funcione "de fábrica". La función que crea este usuario también se niega a
correr si `NODE_ENV=production`, y nunca imprime el password en consola.

Login real devuelve un JWT (`Authorization: Bearer <token>`), firmado con
`JWT_SECRET`. Ninguna mutación (`POST`/`PUT`/`DELETE`) funciona sin ese
token; los `GET` de catálogo son públicos porque el sitio público los
necesita sin sesión.

## 4. Parámetro `bd`

El frontend agrega `?bd=don_pepito_web` a las llamadas `MicroSaas`. La API
**no acepta cualquier valor**: lo compara contra `ALLOWED_BD_NAME` y
responde 400 si no coincide. La base real a la que se conecta el backend es
siempre la de `MYSQL_DATABASE`, sin importar el valor de `bd`.

## 5. Imágenes

`POST /api/Data/images` (requiere JWT) acepta un campo `image` (PNG/JPG/
WebP, menor a 2 MB), genera un nombre UUID (nunca conserva el nombre que manda
el cliente) y lo guarda en `UPLOAD_DIR`. Se sirven de vuelta por
`GET /images/:archivo` vía `express.static` (sin listado de directorio, sin
poder escapar del directorio).

## 6. Reportes de imágenes heredadas (Fase 4)

En `reports/` hay un snapshot de las URLs de imagen que trae el dump
(dominios, cuáles ya no son de `api-centralizador.apiworking.pe`, cuáles usan
`http://` en vez de `https://`). No se modificó ni se re-alojó ninguna URL:
el frontend ya maneja imágenes caídas con `AppImage` + placeholders locales.
Para recuperar las fotos reales hace falta la nueva base de imágenes o los
archivos originales — eso es una decisión de negocio, no algo que el código
pueda resolver solo.

## 7. Pruebas

```bash
npm run lint
npm test
```

Los tests corren contra `don_pepito_web_local` de verdad (no hay mocks de
MySQL): crean sus propios registros de prueba y los borran al terminar. Antes
de correrlos por primera vez, restaura el dump y ejecuta `npm run seed:user`.

## 8. Docker Compose (mysql + backend + frontend)

```bash
cd ..   # raíz del repo
cp .env.compose.example .env
docker compose -f docker-compose.local.yml up -d --build

# primera vez, o para reinicializar datos: restaurar el dump explícitamente
docker compose -f docker-compose.local.yml exec -T mysql \
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" don_pepito_web_local < dump-don_pepito_web-*.sql
docker compose -f docker-compose.local.yml exec backend npm run seed:user
```

- Parar: `docker compose -f docker-compose.local.yml down`
- Reinicializar todo desde cero (borra el volumen de MySQL):
  `docker compose -f docker-compose.local.yml down -v`

El dump **nunca se importa automáticamente** al arrancar los contenedores —
siempre es un paso manual explícito, para no arriesgar sobrescribir datos en
un volumen que ya tenga algo.

## 9. Variables de entorno

Ver `.env.example`. Nunca se commitea `.env` ni el dump (`*.sql` está en
`.gitignore` del repo raíz).

## Limitaciones / decisiones que no se tomaron solas

- Los 2 usuarios reales del dump siguen con sus contraseñas originales; si
  se necesita loguear con ellos hace falta que alguien con la contraseña
  real la use, o se decida explícitamente resetearla.
- Las imágenes rotas de `api-centralizador.apiworking.pe` no se intentaron
  descargar ni re-alojar masivamente (regla explícita de este proyecto).
- Roles/permisos: hoy cualquier usuario autenticado puede hacer cualquier
  mutación (no hay roles admin/editor). Si se necesitan, es una decisión de
  producto pendiente.
