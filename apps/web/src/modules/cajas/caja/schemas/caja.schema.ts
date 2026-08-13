import { z } from "zod";

export const cajaSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio.")
    .max(20, "El código no puede superar los 20 caracteres."),
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z
    .string()
    .max(250, "La descripción no puede superar los 250 caracteres.")
    .optional()
    .nullable(),
});

export type CajaFormValues = z.infer<typeof cajaSchema>;
