import { ok } from "../../utils/apiResponse.js";
import { AppError } from "../../utils/AppError.js";
import { LoginSchema } from "./auth.schema.js";
import * as authService from "./auth.service.js";

export async function login(req, res, next) {
  try {
    var parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Usuario y password son requeridos");
    }

    var result = await authService.login(parsed.data.user, parsed.data.password);

    return ok(res, {
      message: "Login correcto",
      data: [result.user],
      token: result.token,
    });
  } catch (err) {
    return next(err);
  }
}
