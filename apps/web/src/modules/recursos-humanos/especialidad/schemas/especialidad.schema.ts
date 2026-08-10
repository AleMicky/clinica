import { z } from "zod";

export const especialidadSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres.")
    .max(20, "El código no puede superar los 20 caracteres.")
    .toUpperCase(),

  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  descripcion: z
    .string()
    .trim()
    .max(250, "La descripción no puede superar los 250 caracteres.")
    .optional()
    .or(z.literal("")),

  estado: z.enum(["Activo", "Inactivo"]).optional(),
});

export type EspecialidadFormValues = z.infer<typeof especialidadSchema>;
