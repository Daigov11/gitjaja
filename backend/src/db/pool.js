import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export var pool = mysql.createPool({
  host: env.mysqlHost,
  port: env.mysqlPort,
  database: env.mysqlDatabase,
  user: env.mysqlUser,
  password: env.mysqlPassword,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
});
