import { pool } from "../../db/pool.js";
import { AppError } from "../../utils/AppError.js";
import { CarouselSlideSchema } from "./carousel.schema.js";

var FIELDS = "id_slide, slide_title, slide_subtitle, slide_link_url, slide_image_url, slide_position, slide_status, slide_created, slide_actu";

function boolInt(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

function input(body) {
  var b, parsed;
  b = body || {};
  parsed = CarouselSlideSchema.safeParse({
    slide_title: String(b.slide_title || b.slideTitle || "").trim(),
    slide_subtitle: String(b.slide_subtitle || b.slideSubtitle || "").trim(),
    slide_link_url: b.slide_link_url || b.slideLinkUrl || null,
    slide_image_url: b.slide_image_url || b.slideImageUrl || "",
    slide_position: Number(b.slide_position ?? b.slidePosition ?? 0),
    slide_status: boolInt(b.slide_status ?? b.slideStatus ?? 1),
  });
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues.map(function (issue) {
      return issue.path.join(".") + ": " + issue.message;
    }).join("; "));
  }
  return parsed.data;
}

async function assertExists(id) {
  var rows;
  rows = (await pool.query("SELECT id_slide FROM web_carousel_slide WHERE id_slide = ?", [id]))[0];
  if (!rows.length) throw new AppError(404, "Slide no encontrado");
}

export async function listPublic() {
  return (await pool.query("SELECT " + FIELDS + " FROM web_carousel_slide WHERE slide_status = 1 ORDER BY slide_position ASC, id_slide ASC"))[0];
}

export async function listAdmin() {
  return (await pool.query("SELECT " + FIELDS + " FROM web_carousel_slide ORDER BY slide_position ASC, id_slide ASC"))[0];
}

export async function createSlide(body) {
  var data, result;
  data = input(body);
  result = await pool.query(
    "INSERT INTO web_carousel_slide (slide_title, slide_subtitle, slide_link_url, slide_image_url, slide_position, slide_status) VALUES (?, ?, ?, ?, ?, ?)",
    [data.slide_title, data.slide_subtitle, data.slide_link_url, data.slide_image_url, data.slide_position, data.slide_status]
  );
  return { id_slide: result[0].insertId };
}

export async function updateSlide(id, body) {
  var data;
  data = input(body);
  await assertExists(id);
  await pool.query(
    "UPDATE web_carousel_slide SET slide_title = ?, slide_subtitle = ?, slide_link_url = ?, slide_image_url = ?, slide_position = ?, slide_status = ? WHERE id_slide = ?",
    [data.slide_title, data.slide_subtitle, data.slide_link_url, data.slide_image_url, data.slide_position, data.slide_status, id]
  );
}

export async function deleteSlide(id) {
  await assertExists(id);
  await pool.query("DELETE FROM web_carousel_slide WHERE id_slide = ?", [id]);
}
