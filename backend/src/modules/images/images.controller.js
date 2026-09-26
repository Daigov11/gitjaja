import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";

export function upload(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, "Selecciona una imagen primero (campo 'image').");
    }

    return res.status(201).json({
      codResponse: 1,
      message: "Imagen subida",
      url: env.publicUploadBaseUrl + "/" + req.file.filename,
      archivo: req.file.filename,
      formatoDetectado: req.file.mimetype,
    });
  } catch (err) {
    return next(err);
  }
}
