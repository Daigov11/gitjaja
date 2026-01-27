import api from "./apiClient";

export async function listCategories() {
  var res;
  res = await api.get("/MicroSaas/categories", { headers: { accept: "*/*" } });
  return res.data;
}

export async function createCategory(payload) {
  var body, res, img;

  img = "";
  if (payload && payload.category_image_url) img = String(payload.category_image_url);
  if (!img && payload && payload.categoryImageUrl) img = String(payload.categoryImageUrl);

  body = {
    categoryName: payload.category_name || payload.categoryName || "",
    categoryDesc: payload.category_desc || payload.categoryDesc || "",
    categoryStatus: (payload.category_status || payload.categoryStatus) ? 1 : 0,

    // ✅ manda ambos (por compatibilidad)
    categoryImageUrl: img || "",
    category_image_url: img || "",
  };

  res = await api.post("/MicroSaas/categories", body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateCategory(idCategory, payload) {
  var body, res, img;

  img = "";
  if (payload && payload.category_image_url) img = String(payload.category_image_url);
  if (!img && payload && payload.categoryImageUrl) img = String(payload.categoryImageUrl);

  body = {
    categoryName: payload.category_name || payload.categoryName || "",
    categoryDesc: payload.category_desc || payload.categoryDesc || "",
    categoryStatus: (payload.category_status || payload.categoryStatus) ? 1 : 0,

    // ✅ CLAVE: el backend pide esta key (si no, truena)
    categoryImageUrl: img || "",
    category_image_url: img || "",
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
