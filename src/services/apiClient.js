import axios from "axios";

var api;

api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 20000,
});

// Token desde localStorage (MVP)
api.interceptors.request.use(function (config) {
  var token;
  token = localStorage.getItem("erp_token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

// Manejo simple de 401
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
