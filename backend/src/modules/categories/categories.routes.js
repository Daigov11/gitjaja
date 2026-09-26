import { Router } from "express";
import { requireAuth, validateBdParam } from "../../middleware/auth.js";
import * as categoriesController from "./categories.controller.js";

export var categoriesRouter = Router();

categoriesRouter.get("/", validateBdParam, categoriesController.list);
categoriesRouter.post("/", validateBdParam, requireAuth, categoriesController.create);
categoriesRouter.put("/:id", validateBdParam, requireAuth, categoriesController.update);
categoriesRouter.delete("/:id", validateBdParam, requireAuth, categoriesController.remove);
