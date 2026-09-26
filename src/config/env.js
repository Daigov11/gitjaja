// Única capa de configuración de entorno. Todo valor de infraestructura
// (API, imágenes, BD, contacto) debe leerse de aquí, nunca hardcodeado en
// componentes. Los defaults son solo para desarrollo local sin .env.
function readEnv(key, fallback) {
  var value = import.meta.env ? import.meta.env[key] : undefined;
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

export var API_BASE_URL = readEnv(
  "VITE_API_BASE_URL",
  "https://api-centralizador.apiworking.pe/api"
);

export var IMAGES_BASE_URL = readEnv(
  "VITE_IMAGES_BASE_URL",
  "https://api-centralizador.apiworking.pe/images"
);

// Servicio centralizado para subir imágenes. Puede vivir en una infraestructura
// distinta de la API de catálogo (por ejemplo, S3 detrás del centralizador).
export var IMAGE_UPLOAD_URL = readEnv(
  "VITE_IMAGE_UPLOAD_URL",
  "https://api-centralizador.apiworking.pe/api/Data/images"
);

export var BD_NAME = readEnv("VITE_BD_NAME", "don_pepito_web");

export var WHATSAPP_PHONE = readEnv("VITE_WHATSAPP_PHONE", "946762926");
