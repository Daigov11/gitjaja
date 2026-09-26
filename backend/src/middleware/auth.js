import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req, res, next) {
  var header, token, payload;

  header = req.headers.authorization || "";
  token = header.indexOf("Bearer ") === 0 ? header.slice(7).trim() : "";

  if (!token) {
    return next(new AppError(401, "No autenticado"));
  }

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return next(new AppError(401, "Sesión inválida o expirada"));
  }

  req.user = payload;
  next();
}

// La API solo sirve la BD configurada localmente; cualquier otro valor de
// ?bd= se rechaza en vez de aceptarse arbitrariamente.
export function validateBdParam(req, res, next) {
  var bd = req.query.bd;

  if (bd !== undefined && bd !== env.allowedBdName) {
    return next(new AppError(400, "Parámetro 'bd' no soportado en este entorno"));
  }

  next();
}
