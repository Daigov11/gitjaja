import api from "./apiClient";
import { normalizeProduct, toProductApiBody } from "../utils/apiNormalizers";

function normalizeResponse(data) {
  if (data && Array.isArray(data.data)) {
    return { ...data, data: data.data.map(normalizeProduct) };
  }
  return data;
}

export async function listProducts() {
  var res;
  res = await api.get("/MicroSaas/products", {
    headers: { accept: "*/*" },
  });
  return normalizeResponse(res.data);
}

export async function createProduct(payload) {
  var res, body;

  body = toProductApiBody(payload);

  res = await api.post("/MicroSaas/products", body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateProduct(id, payload) {
  var res, body;

  body = toProductApiBody(payload);

  res = await api.put("/MicroSaas/products/" + id, body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function deleteProduct(id) {
  var res;

  res = await api.delete("/MicroSaas/products/" + id, {
    headers: { accept: "*/*" },
  });

  return res.data;
}
