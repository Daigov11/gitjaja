import api from "./apiClient";
import { normalizeCategory, toCategoryApiBody } from "../utils/apiNormalizers";

function normalizeResponse(data) {
  if (data && Array.isArray(data.data)) {
    return { ...data, data: data.data.map(normalizeCategory) };
  }
  return data;
}

export async function listCategories() {
  var res;
  res = await api.get("/MicroSaas/categories", { headers: { accept: "*/*" } });
  return normalizeResponse(res.data);
}

export async function createCategory(payload) {
  var body, res;

  body = toCategoryApiBody(normalizeCategory(payload));

  res = await api.post("/MicroSaas/categories", body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateCategory(idCategory, payload) {
  var body, res;

  body = toCategoryApiBody(normalizeCategory(payload));

  res = await api.put("/MicroSaas/categories/" + idCategory, body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function deleteCategory(idCategory) {
  var res;

  res = await api.delete("/MicroSaas/categories/" + idCategory, {
    headers: { accept: "*/*" },
  });

  return res.data;
}
