import "dotenv/config";

function required(name) {
  var value = process.env[name];
  if (!value) {
    throw new Error("Falta la variable de entorno " + name + " (revisa backend/.env)");
  }
  return value;
}

export var env = {
  port: Number(process.env.PORT || 4000),
  // Por defecto solo localhost: nginx hace de proxy público, el backend
  // nunca debe quedar expuesto directamente a internet.
  host: process.env.HOST || "127.0.0.1",
  nodeEnv: process.env.NODE_ENV || "development",

  mysqlHost: process.env.MYSQL_HOST || "127.0.0.1",
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlDatabase: required("MYSQL_DATABASE"),
  mysqlUser: required("MYSQL_USER"),
  mysqlPassword: process.env.MYSQL_PASSWORD || "",

  allowedBdName: process.env.ALLOWED_BD_NAME || "don_pepito_web",

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  uploadDir: process.env.UPLOAD_DIR || "uploads",
  publicUploadBaseUrl: process.env.PUBLIC_UPLOAD_BASE_URL || "http://localhost:4000/images",
};
