import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env.js";

var ALLOWED_MIME_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

var MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export var uploadDir = path.resolve(process.cwd(), env.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nunca se conserva el nombre que mandó el cliente: se genera un UUID
    // propio para evitar path traversal y colisiones.
    var ext = ALLOWED_MIME_TO_EXT[file.mimetype];
    cb(null, uuidv4() + ext);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
    cb(new Error("Tipo de imagen no permitido. Usa PNG, JPG o WebP."));
    return;
  }
  cb(null, true);
}

export var upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
});
