import { Router } from "express";
import { requireAuth, validateBdParam } from "../../middleware/auth.js";
import * as productsController from "./products.controller.js";

export var productsRouter = Router();

productsRouter.get("/", validateBdParam, productsController.list);
productsRouter.post("/", validateBdParam, requireAuth, productsController.create);
productsRouter.put("/:id", validateBdParam, requireAuth, productsController.update);
productsRouter.delete("/:id", validateBdParam, requireAuth, productsController.remove);
