import { z } from "zod";

export var CarouselSlideSchema = z.object({
  slide_title: z.string().max(160, "Máx 160 caracteres").optional().default(""),
  slide_subtitle: z.string().max(255, "Máx 255 caracteres").optional().default(""),
  slide_link_url: z.string().url("URL de enlace inválida").nullable().optional(),
  slide_image_url: z.string().url("URL de imagen inválida"),
  slide_position: z.number().int().min(0, "La posición no puede ser negativa").default(0),
  slide_status: z.union([z.literal(0), z.literal(1)]).default(1),
});
