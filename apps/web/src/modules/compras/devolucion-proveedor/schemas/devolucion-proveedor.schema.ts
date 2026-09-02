import { z } from "zod";

export const devolucionProveedorDetalleSchema = z.object({
  productoId: z.number().min(1, "Debe seleccionar un producto"),
  productoNombre: z.string().optional(),
  productoCodigo: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  motivo: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
  observacion: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
});

export const devolucionProveedorSchema = z.object({
  proveedorId: z.number().min(1, "Debe seleccionar un proveedor"),
  almacenId: z.number().min(1, "Debe seleccionar un almacén"),
  recepcionCompraId: z.number().nullable().optional(),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  motivo: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "Máximo 200 caracteres"),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
  detalles: z
    .array(devolucionProveedorDetalleSchema)
    .min(1, "Debe agregar al menos un producto a devolver"),
});

export const anularDevolucionSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type DevolucionProveedorDetalleFormValues = z.infer<
  typeof devolucionProveedorDetalleSchema
>;
export type DevolucionProveedorFormValues = z.infer<
  typeof devolucionProveedorSchema
>;
export type AnularDevolucionFormValues = z.infer<
  typeof anularDevolucionSchema
>;
