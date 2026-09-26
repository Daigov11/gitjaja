import { z } from "zod";

export var LoginSchema = z.object({
  bd: z.string().optional(),
  user: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Password requerido"),
});
