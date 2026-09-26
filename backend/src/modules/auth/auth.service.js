import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db/pool.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

export async function login(usuario, password) {
  var rows, user, matches, token;

  rows = (
    await pool.query(
      "SELECT id_usuario, usuario, contrasena FROM mae_usuario WHERE usuario = ?",
      [usuario]
    )
  )[0];

  user = rows[0];

  // Mensaje genérico: no revelar si el problema fue el usuario o el password.
  if (!user) {
    throw new AppError(401, "Usuario o contraseña incorrectos");
  }

  matches = await bcrypt.compare(password, user.contrasena);
  if (!matches) {
    throw new AppError(401, "Usuario o contraseña incorrectos");
  }

  token = jwt.sign({ id_usuario: user.id_usuario, usuario: user.usuario }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    token: token,
    user: { id_usuario: user.id_usuario, usuario: user.usuario },
  };
}
