import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { upload as multerUpload } from "./images.upload.js";
import { AppError } from "../../utils/AppError.js";
import * as imagesController from "./images.controller.js";

export var imagesRouter = Router();

function handleUpload(req, res, next) {
  multerUpload.single("image")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError(400, "La imagen debe pesar menos de 2 MB"));
      }
      return next(new AppError(400, err.message || "No se pudo procesar la imagen"));
    }
    next();
  });
}

imagesRouter.post("/images", requireAuth, handleUpload, imagesController.upload);
