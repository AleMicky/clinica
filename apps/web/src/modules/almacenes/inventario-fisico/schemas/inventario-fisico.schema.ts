import { z } from "zod";

export const inventarioFisicoDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidadSistema: z
    .number()
    .min(0, "La cantidad en sistema no puede ser negativa"),
  cantidadContada: z
    .number()
    .min(0, "La cantidad contada no puede ser negativa")
    .nullable()
    .optional(),
});

export const inventarioFisicoSchema = z.object({
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén"),
  fechaInicio: z
    .string()
    .min(1, "La fecha de inicio es obligatoria"),
  observacion: z.string().trim().max(500).nullable().optional(),
  detalles: z
    .array(inventarioFisicoDetalleSchema)
    .min(1, "Debe agregar al menos un producto a la lista del inventario"),
});

export const anularInventarioSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type InventarioFisicoDetalleFormValues = z.infer<
  typeof inventarioFisicoDetalleSchema
>;
export type InventarioFisicoFormValues = z.infer<
  typeof inventarioFisicoSchema
>;
export type AnularInventarioFormValues = z.infer<
  typeof anularInventarioSchema
>;
