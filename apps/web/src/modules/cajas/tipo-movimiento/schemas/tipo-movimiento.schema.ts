import { z } from "zod";

export const tipoMovimientoCajaSchema = z.object({
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
  naturaleza: z.enum(["ENTRADA", "SALIDA"], {
    error: "Seleccione una naturaleza válida (ENTRADA o SALIDA).",
  }),
  descripcion: z
    .string()
    .max(250, "La descripción no puede superar los 250 caracteres.")
    .optional()
    .nullable(),
});

export type TipoMovimientoCajaFormValues = z.infer<typeof tipoMovimientoCajaSchema>;

// Re-export concepto schema for backwards compatibility
export {
  conceptoMovimientoCajaSchema,
  type ConceptoMovimientoCajaFormValues,
} from "./concepto-movimiento.schema";
