// Extrae el mensaje real del backend ({codResponse, message}) de un error de
// axios en vez de mostrar el genérico "Request failed with status code 409".
export function extractErrorMessage(err) {
  var backendMessage = err && err.response && err.response.data && err.response.data.message;
  if (backendMessage) return String(backendMessage);
  if (err && err.message) return String(err.message);
  return String(err);
}
