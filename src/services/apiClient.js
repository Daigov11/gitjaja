import axios from "axios";
import { API_BASE_URL, BD_NAME } from "./appConfig";
import { getToken, clearAuth } from "../state/auth";

// Exportadas por separado para poder probarlas sin depender de los
// internals de axios (interceptors.request.handlers).
export function addAuthAndBdParams(config) {
  var token, url;

  token = getToken();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = "Bearer " + token;
    }
  }

  url = String(config.url || "");

  // Inyecta bd SOLO en MicroSaas, para no afectar login ni upload
  if (url.indexOf("/MicroSaas/") !== -1) {
    if (url.indexOf("bd=") === -1) {
      config.params = config.params || {};
      if (!config.params.bd) config.params.bd = BD_NAME;
    }
  }

  return config;
}

export function handleResponseError(err) {
  if (err && err.response && err.response.status === 401) {
    clearAuth();
    // Fuera de un componente React no hay acceso a useNavigate; se evita el
    // loop de redirección comprobando que no estemos ya en /login.
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return Promise.reject(err);
}

var api;

api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(addAuthAndBdParams);

api.interceptors.response.use(function (res) {
  return res;
}, handleResponseError);

export default api;
