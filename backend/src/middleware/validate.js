import { AppError } from "../utils/AppError.js";

export function validateBody(schema) {
  return function (req, res, next) {
    var result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new AppError(400, result.error.issues.map(function (i) {
        return i.path.join(".") + ": " + i.message;
      }).join("; ")));
    }
    req.validatedBody = result.data;
    next();
  };
}
