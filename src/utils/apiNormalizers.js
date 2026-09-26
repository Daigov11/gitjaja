// La API mezcla booleanos como 0/1, "0"/"1", true/false y a veces null/"".
// toBoolean() es la única fuente de verdad para interpretar esos valores.
export function toBoolean(value) {
  if (value === true || value === 1 || value === "1") return true;
  if (
    value === false ||
    value === 0 ||
    value === "0" ||
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }
  return Boolean(value);
}

export function toNullableString(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

export function toNumberOrNull(value) {
  var n;
  if (value === null || value === undefined || value === "") return null;
  n = Number(value);
  return isNaN(n) ? null : n;
}

function pick(raw, camelKey, snakeKey) {
  if (raw[camelKey] !== undefined) return raw[camelKey];
  return raw[snakeKey];
}

// Normaliza un producto crudo de la API (o de un form) a un shape único en snake_case,
// aceptando indistintamente las variantes camelCase/snake_case que devuelve el backend.
export function normalizeProduct(raw) {
  var source = raw || {};

  return {
    id_product: pick(source, "idProduct", "id_product") ?? null,
    id_category: toNumberOrNull(pick(source, "idCategory", "id_category")) ?? 0,
    category_name: pick(source, "categoryName", "category_name") || "",
    product_name: pick(source, "productName", "product_name") || "",
    product_desc: pick(source, "productDesc", "product_desc") || "",
    product_url: toNullableString(pick(source, "productUrl", "product_url")),
    product_image_url: toNullableString(pick(source, "productImageUrl", "product_image_url")),
    has_price: toBoolean(pick(source, "hasPrice", "has_price")),
    price: toNumberOrNull(pick(source, "price", "price")),
    product_status: toBoolean(pick(source, "productStatus", "product_status")),
    product_created: pick(source, "productCreated", "product_created") || null,
    product_actu: pick(source, "productActu", "product_actu") || null,
  };
}

// Normaliza una categoría cruda de la API (o de un form) a un shape único en snake_case.
export function normalizeCategory(raw) {
  var source = raw || {};
  var image =
    toNullableString(pick(source, "categoryImageUrl", "category_image_url")) || "";

  return {
    id_category: pick(source, "idCategory", "id_category") ?? null,
    category_name: pick(source, "categoryName", "category_name") || "",
    category_desc: pick(source, "categoryDesc", "category_desc") || "",
    category_image_url: image,
    category_status: toBoolean(pick(source, "categoryStatus", "category_status")),
    category_created: pick(source, "categoryCreated", "category_created") || null,
    category_actu: pick(source, "categoryActu", "category_actu") || null,
  };
}

// Construye el body camelCase que espera POST/PUT /MicroSaas/products a partir
// de un valor de formulario/normalizado en snake_case.
export function toProductApiBody(formValue) {
  var v = formValue || {};
  var hasPrice = toBoolean(v.has_price);

  return {
    idCategory: toNumberOrNull(v.id_category) || 0,
    productName: String(v.product_name || ""),
    productDesc: v.product_desc ? String(v.product_desc) : "",
    productUrl: toNullableString(v.product_url),
    productImageUrl: toNullableString(v.product_image_url),
    hasPrice: hasPrice ? 1 : 0,
    price: hasPrice ? toNumberOrNull(v.price) || 0 : 0,
    productStatus: toBoolean(v.product_status) ? 1 : 0,
  };
}

// Construye el body que espera POST/PUT /MicroSaas/categories, mandando ambas
// variantes de la key de imagen por compatibilidad con el backend actual.
export function toCategoryApiBody(formValue) {
  var v = formValue || {};
  var image = toNullableString(v.category_image_url) || "";

  return {
    categoryName: String(v.category_name || ""),
    categoryDesc: v.category_desc ? String(v.category_desc) : "",
    categoryStatus: toBoolean(v.category_status) ? 1 : 0,
    categoryImageUrl: image,
    category_image_url: image,
  };
}
