import axios from "axios";
import { IMAGE_UPLOAD_URL } from "../config/env";

var MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export async function uploadImage(file) {
  var fd, res, data;

  if (!file) throw new Error("Selecciona una imagen primero.");
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen debe pesar menos de 2 MB.");
  }

  fd = new FormData();
  fd.append("image", file); // IMPORTANTE: el campo debe llamarse "image"

  // No fijar Content-Type manualmente: Axios agrega el boundary multipart
  // correcto. Este servicio puede ser externo a la API local del catálogo.
  res = await axios.post(IMAGE_UPLOAD_URL, fd, {
    headers: { accept: "*/*" },
  });

  data = res.data || {};

  if (!data.url) throw new Error("La API no devolvió la url. Respuesta inválida.");

  return data; // { archivo, url, formatoDetectado }
}
