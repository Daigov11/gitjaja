// Forma de respuesta homogénea, compatible con lo que el frontend ya espera.
export function ok(res, options) {
  var opts = options || {};
  return res.status(opts.status || 200).json({
    codResponse: 1,
    message: opts.message || "Operación realizada correctamente",
    data: opts.data === undefined ? [] : opts.data,
    ...(opts.token ? { token: opts.token } : {}),
  });
}

export function fail(res, options) {
  var opts = options || {};
  return res.status(opts.status || 400).json({
    codResponse: 0,
    message: opts.message || "Ocurrió un error",
    data: opts.data === undefined ? [] : opts.data,
  });
}
