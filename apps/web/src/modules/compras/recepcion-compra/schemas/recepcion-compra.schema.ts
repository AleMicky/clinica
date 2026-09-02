import { z } from "zod";

export const recepcionCompraDetalleSchema = z.object({
  ordenCompraDetalleId: z.number().min(1, "Detalle de orden requerido"),
  productoId: z.number().min(1, "Producto requerido"),
  productoNombre: z.string().optional(),
  productoCodigo: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidadRecibida: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().min(0, "El precio no puede ser negativo"),
  observacion: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
});

export const recepcionCompraSchema = z.object({
  ordenCompraId: z.number().min(1, "Debe seleccionar una orden de compra"),
  almacenId: z.number().min(1, "Debe seleccionar un almacén"),
  fechaRecepcion: z.string().min(1, "La fecha de recepción es obligatoria"),
  numeroFactura: z.string().trim().max(50, "Máximo 50 caracteres").nullable().optional(),
  numeroRemision: z.string().trim().max(50, "Máximo 50 caracteres").nullable().optional(),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
  detalles: z
    .array(recepcionCompraDetalleSchema)
    .min(1, "Debe registrar al menos un producto a recibir"),
});

export const anularRecepcionSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type RecepcionCompraDetalleFormValues = z.infer<
  typeof recepcionCompraDetalleSchema
>;
export type RecepcionCompraFormValues = z.infer<typeof recepcionCompraSchema>;
export type AnularRecepcionFormValues = z.infer<typeof anularRecepcionSchema>;
