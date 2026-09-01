import { z } from "zod";
import { NaturalezaMovimiento } from "../types/tipo-movimiento-inventario.types";

export const tipoMovimientoInventarioSchema = z.object({
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
  naturaleza: z
    .nativeEnum(NaturalezaMovimiento, {
      message: "Seleccione una naturaleza válida",
    }),
});

export type TipoMovimientoInventarioFormValues = z.infer<
  typeof tipoMovimientoInventarioSchema
>;
