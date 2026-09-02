import { z } from "zod";

export const movimientoInventarioDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidad: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  costoUnitario: z
    .number()
    .min(0, "El costo unitario no puede ser negativo")
    .nullable()
    .optional(),
});

export const movimientoInventarioSchema = z.object({
  numero: z.string().optional(),
  tipoMovimientoInventarioId: z
    .number()
    .min(1, "Debe seleccionar un tipo de movimiento válido"),
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén válido"),
  fechaMovimiento: z
    .string()
    .min(1, "La fecha de movimiento es obligatoria"),
  referenciaTipo: z.string().trim().max(100).nullable().optional(),
  referenciaId: z.number().nullable().optional(),
  observacion: z.string().trim().max(500).nullable().optional(),
  detalles: z
    .array(movimientoInventarioDetalleSchema)
    .min(1, "Debe agregar al menos un producto en el detalle del movimiento"),
});

export const anularMovimientoSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type MovimientoInventarioDetalleFormValues = z.infer<
  typeof movimientoInventarioDetalleSchema
>;
export type MovimientoInventarioFormValues = z.infer<
  typeof movimientoInventarioSchema
>;
export type AnularMovimientoFormValues = z.infer<typeof anularMovimientoSchema>;
