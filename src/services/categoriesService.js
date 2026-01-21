import api from "./apiClient";

export async function listCategories() {
  var res;
  res = await api.get("/MicroSaas/categories", { headers: { accept: "*/*" } });
  return res.data;
}

export async function createCategory(payload) {
  var body, res;

  body = {
    categoryName: payload.category_name || "",
    categoryDesc: payload.category_desc || "",
    categoryStatus: payload.category_status ? 1 : 0,
  };

  res = await api.post("/MicroSaas/categories", body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateCategory(idCategory, payload) {
  var body, res;

  body = {
    categoryName: payload.category_name || "",
    categoryDesc: payload.category_desc || "",
    categoryStatus: payload.category_status ? 1 : 0,
  };

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
