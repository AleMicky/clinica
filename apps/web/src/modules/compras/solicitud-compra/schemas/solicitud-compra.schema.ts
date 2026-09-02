import { z } from "zod";

export const solicitudCompraDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  productoCodigo: z.string().optional(),
  cantidadSolicitada: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  observacion: z.string().trim().max(250, "Máximo 250 caracteres").nullable().optional(),
});

export const solicitudCompraSchema = z.object({
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén"),
  fechaSolicitud: z
    .string()
    .min(1, "La fecha de solicitud es obligatoria"),
  fechaRequerida: z.string().nullable().optional(),
  observacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
  detalles: z
    .array(solicitudCompraDetalleSchema)
    .min(1, "Debe agregar al menos un producto a la solicitud"),
});

export const aprobarSolicitudSchema = z.object({
  observacionAprobacion: z.string().trim().max(500, "Máximo 500 caracteres").nullable().optional(),
});

export const rechazarSolicitudSchema = z.object({
  motivoRechazo: z
    .string()
    .trim()
    .min(3, "El motivo de rechazo debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export const cancelarSolicitudSchema = z.object({
  motivoCancelacion: z
    .string()
    .trim()
    .min(3, "El motivo de cancelación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type SolicitudCompraDetalleFormValues = z.infer<
  typeof solicitudCompraDetalleSchema
>;
export type SolicitudCompraFormValues = z.infer<typeof solicitudCompraSchema>;
export type AprobarSolicitudFormValues = z.infer<typeof aprobarSolicitudSchema>;
export type RechazarSolicitudFormValues = z.infer<typeof rechazarSolicitudSchema>;
export type CancelarSolicitudFormValues = z.infer<typeof cancelarSolicitudSchema>;
