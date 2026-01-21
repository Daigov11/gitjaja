import api from "./apiClient";

export async function uploadImage(file) {
  var fd, res, data;

  if (!file) throw new Error("Selecciona una imagen primero.");

  fd = new FormData();
  fd.append("image", file); // IMPORTANTE: el campo debe llamarse "image"

  res = await api.post("/Data/images", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
      accept: "*/*",
    },
  });

  data = res.data || {};

  if (!data.url) throw new Error("La API no devolvió la url. Respuesta inválida.");

  return data; // { archivo, url, formatoDetectado }
}
