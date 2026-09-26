import { pool } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { normalizeProductInput } from "../../utils/normalizers.js";
import { ProductSchema } from "./products.schema.js";

var LIST_SQL =
  "SELECT p.id_product, p.id_category, c.category_name, p.product_name, " +
  "p.product_desc, p.product_url, p.product_image_url, p.has_price, p.price, " +
  "p.product_status, p.product_created, p.product_actu " +
  "FROM ven_product p LEFT JOIN ven_category c ON c.id_category = p.id_category " +
  "ORDER BY p.id_product DESC";

export async function listProducts() {
  var [rows] = await pool.query(LIST_SQL);
  return rows;
}

async function assertCategoryExists(idCategory) {
  var [rows] = await pool.query("SELECT id_category FROM ven_category WHERE id_category = ?", [
    idCategory,
  ]);
  if (!rows.length) {
    throw new AppError(400, "La categoría indicada no existe");
  }
}

function parseProductInput(body) {
  var normalized = normalizeProductInput(body);
  var parsed = ProductSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new AppError(
      400,
      parsed.error.issues.map(function (i) {
        return i.path.join(".") + ": " + i.message;
      }).join("; ")
    );
  }
  return parsed.data;
}

export async function createProduct(body) {
  var data, result;

  data = parseProductInput(body);
  await assertCategoryExists(data.id_category);

  result = await pool.query(
    "INSERT INTO ven_product " +
      "(id_category, product_name, product_desc, product_url, product_image_url, has_price, price, product_status) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.id_category,
      data.product_name,
      data.product_desc,
      data.product_url,
      data.product_image_url,
      data.has_price,
      data.price,
      data.product_status,
    ]
  );

  return { id_product: result[0].insertId };
}

export async function updateProduct(id, body) {
  var data;

  data = parseProductInput(body);
  await assertCategoryExists(data.id_category);

  await assertProductExists(id);

  await pool.query(
    "UPDATE ven_product SET id_category = ?, product_name = ?, product_desc = ?, " +
      "product_url = ?, product_image_url = ?, has_price = ?, price = ?, product_status = ? " +
      "WHERE id_product = ?",
    [
      data.id_category,
      data.product_name,
      data.product_desc,
      data.product_url,
      data.product_image_url,
      data.has_price,
      data.price,
      data.product_status,
      id,
    ]
  );
}

async function assertProductExists(id) {
  var [rows] = await pool.query("SELECT id_product FROM ven_product WHERE id_product = ?", [id]);
  if (!rows.length) {
    throw new AppError(404, "Producto no encontrado");
  }
}

export async function deleteProduct(id) {
  await assertProductExists(id);
  await pool.query("DELETE FROM ven_product WHERE id_product = ?", [id]);
}
