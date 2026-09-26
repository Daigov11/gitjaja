import { z } from "zod";

// Valida el shape YA normalizado (snake_case, tipos reales), no el payload
// crudo camelCase/snake_case que manda el cliente.
export var ProductSchema = z.object({
  id_category: z.number().int().positive("Selecciona una categoría válida"),
  product_name: z.string().min(2, "Nombre requerido").max(255, "Máx 255"),
  product_desc: z.string().max(3000, "Máx 3000").optional().default(""),
  product_url: z.string().url("URL inválida").nullable().optional(),
  product_image_url: z.string().url("URL de imagen inválida").nullable().optional(),
  has_price: z.union([z.literal(0), z.literal(1)]),
  price: z.number().nonnegative("Precio inválido"),
  product_status: z.union([z.literal(0), z.literal(1)]),
});
