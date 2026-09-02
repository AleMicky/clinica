import { z } from "zod";

export const cotizacionCompraDetalleSchema = z.object({
  productoId: z.number().min(1, "Debe seleccionar un producto"),
  productoNombre: z.string().optional(),
  productoCodigo: z.string().optional(),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().min(0, "El precio unitario no puede ser negativo"),
  descuento: z.number().min(0, "El descuento no puede ser negativo"),
  observacion: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
});

export const cotizacionCompraSchema = z.object({
  proveedorId: z.number().min(1, "Debe seleccionar un proveedor"),
  solicitudCompraId: z.number().nullable().optional(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  fechaVencimiento: z.string().nullable().optional(),
  condicionPago: z.string().trim().max(100, "Máximo 100 caracteres").nullable().optional(),
  tiempoEntrega: z.string().trim().max(100, "Máximo 100 caracteres").nullable().optional(),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
  detalles: z
    .array(cotizacionCompraDetalleSchema)
    .min(1, "Debe agregar al menos un producto a la cotización"),
});

export const cancelarCotizacionSchema = z.object({
  motivoCancelacion: z
    .string()
    .trim()
    .min(3, "El motivo de cancelación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type CotizacionCompraDetalleFormValues = z.infer<
  typeof cotizacionCompraDetalleSchema
>;
export type CotizacionCompraFormValues = z.infer<typeof cotizacionCompraSchema>;
export type CancelarCotizacionFormValues = z.infer<
  typeof cancelarCotizacionSchema
>;
