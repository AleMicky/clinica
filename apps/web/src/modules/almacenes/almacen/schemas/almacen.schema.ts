import { z } from "zod";

export const almacenSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(10, "El código no debe exceder 10 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(250, "La descripción no debe exceder 250 caracteres")
    .optional()
    .nullable(),
  ubicacion: z
    .string()
    .max(250, "La ubicación no debe exceder 250 caracteres")
    .optional()
    .nullable(),
});

export type AlmacenFormValues = z.infer<typeof almacenSchema>;
