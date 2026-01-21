import axios from "axios";
import { API_BASE_URL, BD_NAME } from "./appConfig";
import { getToken } from "../state/auth";

var api;

api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(function (config) {
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
});

api.interceptors.response.use(
  function (res) {
    return res;
  },
  function (err) {
    if (err && err.response && err.response.status === 401) {
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
