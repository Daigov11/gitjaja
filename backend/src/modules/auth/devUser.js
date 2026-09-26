import bcrypt from "bcrypt";
import { pool } from "../../db/pool.js";

// Compartido entre scripts/seedLocalUser.js y los tests: crea (si no existe)
// un usuario de desarrollo local sin tocar los usuarios reales del dump.
//
// No hay ningún password hardcodeado aquí: LOCAL_DEV_PASSWORD es obligatorio
// desde el entorno (backend/.env, nunca versionado) y esta función se niega
// a correr en producción.
export var LOCAL_DEV_USER = process.env.LOCAL_DEV_USER || "dev.local@donpepito.test";

export async function ensureLocalDevUser() {
  var password, existing, hash;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ensureLocalDevUser no puede ejecutarse con NODE_ENV=production");
  }

  password = process.env.LOCAL_DEV_PASSWORD;
  if (!password) {
    throw new Error(
      "Falta LOCAL_DEV_PASSWORD en el entorno. Defínelo en backend/.env (ver .env.example) antes de correr npm run seed:user o los tests."
    );
  }

  existing = (
    await pool.query("SELECT id_usuario FROM mae_usuario WHERE usuario = ?", [LOCAL_DEV_USER])
  )[0];

  if (existing.length) {
    return existing[0].id_usuario;
  }

  hash = await bcrypt.hash(password, 12);
  return (
    await pool.query("INSERT INTO mae_usuario (usuario, contrasena) VALUES (?, ?)", [
      LOCAL_DEV_USER,
      hash,
    ])
  )[0].insertId;
}
