import { pool } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { normalizeCategoryInput } from "../../utils/normalizers.js";
import { CategorySchema } from "./categories.schema.js";

export async function listCategories() {
  var [rows] = await pool.query(
    "SELECT id_category, category_name, category_desc, category_image_url, " +
      "category_status, category_created, category_actu " +
      "FROM ven_category ORDER BY id_category DESC"
  );
  return rows;
}

function parseCategoryInput(body) {
  var normalized = normalizeCategoryInput(body);
  var parsed = CategorySchema.safeParse(normalized);
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

async function assertCategoryExists(id) {
  var [rows] = await pool.query("SELECT id_category FROM ven_category WHERE id_category = ?", [
    id,
  ]);
  if (!rows.length) {
    throw new AppError(404, "Categoría no encontrada");
  }
}

export async function createCategory(body) {
  var data, result;

  data = parseCategoryInput(body);

  result = await pool.query(
    "INSERT INTO ven_category (category_name, category_desc, category_status, category_image_url, category_created) " +
      "VALUES (?, ?, ?, ?, NOW())",
    [data.category_name, data.category_desc, data.category_status, data.category_image_url]
  );

  return { id_category: result[0].insertId };
}

export async function updateCategory(id, body) {
  var data;

  data = parseCategoryInput(body);
  await assertCategoryExists(id);

  await pool.query(
    "UPDATE ven_category SET category_name = ?, category_desc = ?, category_status = ?, " +
      "category_image_url = ?, category_actu = NOW() WHERE id_category = ?",
    [data.category_name, data.category_desc, data.category_status, data.category_image_url, id]
  );
}

export async function deleteCategory(id) {
  var productRows;

  await assertCategoryExists(id);

  productRows = (
    await pool.query("SELECT COUNT(*) AS total FROM ven_product WHERE id_category = ?", [id])
  )[0];

  if (productRows[0].total > 0) {
    throw new AppError(
      409,
      "No se puede eliminar: la categoría tiene " + productRows[0].total + " producto(s) asociado(s)."
    );
  }

  await pool.query("DELETE FROM ven_category WHERE id_category = ?", [id]);
}
