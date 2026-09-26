import { ok } from "../../utils/apiResponse.js";
import * as categoriesService from "./categories.service.js";

export async function list(req, res, next) {
  try {
    var categories = await categoriesService.listCategories();
    return ok(res, { message: "Categorías obtenidas", data: categories });
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    var result = await categoriesService.createCategory(req.body);
    return ok(res, { status: 201, message: "Categoría creada", data: [result] });
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    await categoriesService.updateCategory(Number(req.params.id), req.body);
    return ok(res, { message: "Categoría actualizada" });
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await categoriesService.deleteCategory(Number(req.params.id));
    return ok(res, { message: "Categoría eliminada" });
  } catch (err) {
    return next(err);
  }
}
