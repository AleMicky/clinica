import { z } from "zod";

export const transferenciaAlmacenDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidadSolicitada: z
    .number()
    .positive("La cantidad solicitada debe ser mayor a 0"),
});

export const transferenciaAlmacenSchema = z
  .object({
    numero: z
      .string()
      .trim()
      .min(1, "El número de transferencia es obligatorio")
      .max(50, "El número no puede exceder 50 caracteres"),
    almacenOrigenId: z
      .number()
      .min(1, "Debe seleccionar el almacén de origen"),
    almacenDestinoId: z
      .number()
      .min(1, "Debe seleccionar el almacén de destino"),
    fechaSolicitud: z
      .string()
      .min(1, "La fecha de solicitud es obligatoria"),
    observacion: z.string().trim().max(500).nullable().optional(),
    detalles: z
      .array(transferenciaAlmacenDetalleSchema)
      .min(1, "Debe agregar al menos un producto a la transferencia"),
  })
  .refine((data) => data.almacenOrigenId !== data.almacenDestinoId, {
    message: "El almacén de destino debe ser diferente al de origen",
    path: ["almacenDestinoId"],
  });

export const cancelarTransferenciaSchema = z.object({
  motivoCancelacion: z
    .string()
    .trim()
    .min(3, "El motivo de cancelación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type TransferenciaAlmacenDetalleFormValues = z.infer<
  typeof transferenciaAlmacenDetalleSchema
>;
export type TransferenciaAlmacenFormValues = z.infer<
  typeof transferenciaAlmacenSchema
>;
export type CancelarTransferenciaFormValues = z.infer<
  typeof cancelarTransferenciaSchema
>;
