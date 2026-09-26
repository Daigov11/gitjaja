import { z } from "zod";

export var CategorySchema = z.object({
  category_name: z.string().min(2, "Nombre requerido").max(255, "Máx 255"),
  category_desc: z.string().max(255, "Máx 255").optional().default(""),
  category_status: z.union([z.literal(0), z.literal(1)]),
  category_image_url: z.string().url("URL de imagen inválida").nullable().optional(),
});
