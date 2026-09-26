// Inserta un usuario admin SOLO para desarrollo local. Nunca toca ni
// sobrescribe los usuarios reales que vinieron en el dump
// (jrafael.apiworking@gmail.com, admin@gmail.com) cuyas contraseñas reales
// no se pueden recuperar desde su hash bcrypt.
//
// Requiere LOCAL_DEV_PASSWORD en backend/.env (ver .env.example). No se
// imprime ningún password en consola.
//
// Uso: node scripts/seedLocalUser.js
import { pool } from "../src/db/pool.js";
import { ensureLocalDevUser, LOCAL_DEV_USER } from "../src/modules/auth/devUser.js";

async function main() {
  var id = await ensureLocalDevUser();

  console.log("Usuario de desarrollo listo (id_usuario=" + id + "):");
  console.log("  usuario: " + LOCAL_DEV_USER);
  console.log("  password: la que definiste en LOCAL_DEV_PASSWORD (backend/.env)");
  console.log("(Solo para don_pepito_web_local. Los 2 usuarios originales del dump no fueron modificados.)");

  await pool.end();
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
