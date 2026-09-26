import { fail } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return fail(res, { status: err.status, message: err.message });
  }

  // Restricción de FK de MySQL (categoría con productos, etc.) que no haya
  // sido detectada de antemano por el service.
  if (err && err.code === "ER_ROW_IS_REFERENCED_2") {
    return fail(res, {
      status: 409,
      message: "No se puede eliminar: hay registros relacionados.",
    });
  }

  console.error(err);
  return fail(res, { status: 500, message: "Error interno del servidor" });
}

export function notFoundHandler(req, res) {
  return fail(res, { status: 404, message: "Recurso no encontrado" });
}
