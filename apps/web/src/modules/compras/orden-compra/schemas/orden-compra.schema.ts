import { z } from "zod";

export const ordenCompraDetalleSchema = z.object({
  productoId: z.number().min(1, "Debe seleccionar un producto"),
  productoNombre: z.string().optional(),
  productoCodigo: z.string().optional(),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().min(0, "El precio no puede ser negativo"),
  descuento: z.number().min(0, "El descuento no puede ser negativo"),
  observacion: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
});

export const ordenCompraSchema = z.object({
  proveedorId: z.number().min(1, "Debe seleccionar un proveedor"),
  almacenId: z.number().min(1, "Debe seleccionar un almacén"),
  solicitudCompraId: z.number().nullable().optional(),
  cotizacionCompraId: z.number().nullable().optional(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  fechaEntregaEsperada: z.string().nullable().optional(),
  condicionPago: z.string().trim().max(100, "Máximo 100 caracteres").nullable().optional(),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
  detalles: z
    .array(ordenCompraDetalleSchema)
    .min(1, "Debe agregar al menos un producto a la orden"),
});

export const cancelarOrdenSchema = z.object({
  motivoCancelacion: z
    .string()
    .trim()
    .min(3, "El motivo de cancelación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type OrdenCompraDetalleFormValues = z.infer<
  typeof ordenCompraDetalleSchema
>;
export type OrdenCompraFormValues = z.infer<typeof ordenCompraSchema>;
export type CancelarOrdenFormValues = z.infer<typeof cancelarOrdenSchema>;
