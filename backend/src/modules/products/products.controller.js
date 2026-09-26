import { ok } from "../../utils/apiResponse.js";
import * as productsService from "./products.service.js";

export async function list(req, res, next) {
  try {
    var products = await productsService.listProducts();
    return ok(res, { message: "Productos obtenidos", data: products });
  } catch (err) {
    return next(err);
  }
}

export async function create(req, res, next) {
  try {
    var result = await productsService.createProduct(req.body);
    return ok(res, { status: 201, message: "Producto creado", data: [result] });
  } catch (err) {
    return next(err);
  }
}

export async function update(req, res, next) {
  try {
    await productsService.updateProduct(Number(req.params.id), req.body);
    return ok(res, { message: "Producto actualizado" });
  } catch (err) {
    return next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await productsService.deleteProduct(Number(req.params.id));
    return ok(res, { message: "Producto eliminado" });
  } catch (err) {
    return next(err);
  }
}
