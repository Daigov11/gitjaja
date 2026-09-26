import { ok } from "../../utils/apiResponse.js";
import * as carousel from "./carousel.service.js";

export async function listPublic(req, res, next) {
  try { return ok(res, { message: "Slides obtenidos", data: await carousel.listPublic() }); } catch (err) { return next(err); }
}
export async function listAdmin(req, res, next) {
  try { return ok(res, { message: "Slides obtenidos", data: await carousel.listAdmin() }); } catch (err) { return next(err); }
}
export async function create(req, res, next) {
  try { return ok(res, { status: 201, message: "Slide creado", data: [await carousel.createSlide(req.body)] }); } catch (err) { return next(err); }
}
export async function update(req, res, next) {
  try { await carousel.updateSlide(Number(req.params.id), req.body); return ok(res, { message: "Slide actualizado" }); } catch (err) { return next(err); }
}
export async function remove(req, res, next) {
  try { await carousel.deleteSlide(Number(req.params.id)); return ok(res, { message: "Slide eliminado" }); } catch (err) { return next(err); }
}
