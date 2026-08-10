import { z } from "zod";

export const rolSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del rol debe tener al menos 2 caracteres.")
    .max(256, "El nombre del rol no puede superar los 256 caracteres."),

  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar 500 caracteres.")
    .optional(),
});

export type RolFormValues = z.infer<typeof rolSchema>;
