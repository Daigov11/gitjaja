import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadDir } from "./modules/images/images.upload.js";

export function createApp() {
  var app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", function (req, res) {
    res.json({ ok: true });
  });

  app.use("/images", express.static(uploadDir, { index: false }));
  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
