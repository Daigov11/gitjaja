// Acepta payloads en camelCase o snake_case (compatibilidad con el frontend
// legado) y normaliza a los tipos reales de columna (0/1, nunca strings
// ambiguas como "0"/"1").
export function toBoolInt(value) {
  if (value === true || value === 1 || value === "1") return 1;
  return 0;
}

function pick(body, camelKey, snakeKey) {
  if (body[camelKey] !== undefined) return body[camelKey];
  return body[snakeKey];
}

export function normalizeProductInput(body) {
  var b = body || {};
  var hasPrice = toBoolInt(pick(b, "hasPrice", "has_price"));
  var price = pick(b, "price", "price");

  return {
    id_category: Number(pick(b, "idCategory", "id_category")) || 0,
    product_name: String(pick(b, "productName", "product_name") || "").trim(),
    product_desc: pick(b, "productDesc", "product_desc") || "",
    product_url: pick(b, "productUrl", "product_url") || null,
    product_image_url: pick(b, "productImageUrl", "product_image_url") || null,
    has_price: hasPrice,
    price: hasPrice ? Number(price || 0) : 0,
    product_status: toBoolInt(pick(b, "productStatus", "product_status")),
  };
}

export function normalizeCategoryInput(body) {
  var b = body || {};
  var image = pick(b, "categoryImageUrl", "category_image_url") || "";

  return {
    category_name: String(pick(b, "categoryName", "category_name") || "").trim(),
    category_desc: pick(b, "categoryDesc", "category_desc") || "",
    category_status: toBoolInt(pick(b, "categoryStatus", "category_status")),
    category_image_url: image || null,
  };
}
