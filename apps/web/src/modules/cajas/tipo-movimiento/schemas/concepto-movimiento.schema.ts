import { z } from "zod";

export const conceptoMovimientoCajaSchema = z.object({
  tipoMovimientoCajaId: z
    .number({
      error: "El tipo de movimiento es obligatorio.",
    })
    .int()
    .positive("Debe seleccionar un tipo de movimiento."),
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .max(50, "El código no puede superar los 50 caracteres."),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z
    .string()
    .max(250, "La descripción no puede superar los 250 caracteres.")
    .optional()
    .nullable(),
});

export type ConceptoMovimientoCajaFormValues = z.infer<typeof conceptoMovimientoCajaSchema>;
