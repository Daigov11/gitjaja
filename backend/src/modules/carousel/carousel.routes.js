import { Router } from "express";
import { requireAuth, validateBdParam } from "../../middleware/auth.js";
import * as controller from "./carousel.controller.js";

export var carouselRouter = Router();

carouselRouter.get("/", validateBdParam, controller.listPublic);
carouselRouter.get("/admin", validateBdParam, requireAuth, controller.listAdmin);
carouselRouter.post("/", validateBdParam, requireAuth, controller.create);
carouselRouter.put("/:id", validateBdParam, requireAuth, controller.update);
carouselRouter.delete("/:id", validateBdParam, requireAuth, controller.remove);
