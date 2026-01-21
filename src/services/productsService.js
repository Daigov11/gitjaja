import api from "./apiClient";

export async function listProducts() {
  var res;
  res = await api.get("/MicroSaas/products", {
    headers: { accept: "*/*" },
  });
  return res.data;
}

export async function createProduct(payload) {
  var res, body;

  body = toApiBody(payload);

  res = await api.post("/MicroSaas/products", body, {
    headers: { accept: "*/*", "Content-Type": "application/json" },
  });

  return res.data;
}

export async function updateProduct(id, payload) {
  var res, body;

  body = toApiBody(payload);

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

function toApiBody(p) {
  var out;

  out = {};
  out.idCategory = Number(p.id_category || p.idCategory || 0);

  out.productName = String(p.product_name || "");
  out.productDesc = p.product_desc ? String(p.product_desc) : "";
  out.productUrl = p.product_url ? String(p.product_url) : null;
  out.productImageUrl = p.product_image_url ? String(p.product_image_url) : null;

  // La API acepta 0/1 (según tus curls)
  out.hasPrice = p.has_price ? 1 : 0;

  // Si no hay precio, mandamos 0 (según curl)
  out.price = p.has_price ? Number(p.price || 0) : 0;

  out.productStatus = p.product_status ? 1 : 0;

  return out;
}
