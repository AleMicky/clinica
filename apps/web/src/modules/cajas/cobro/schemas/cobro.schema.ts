import { z } from "zod";

export const cobroDetalleSchema = z.object({
  metodoPagoId: z.number().min(1, "Seleccione un método de pago."),
  monedaId: z.number().min(1, "Seleccione una moneda."),
  cuentaBancariaId: z.number().optional().nullable(),
  monto: z.number().positive("El monto debe ser mayor a 0."),
  tipoCambio: z.number().default(1),
  referencia: z.string().max(100).optional().nullable(),
  entidadFinanciera: z.string().max(100).optional().nullable(),
  observacion: z.string().max(250).optional().nullable(),
});

export const confirmarCobroSchema = z.object({
  observacion: z.string().max(500).optional().nullable(),
  detalles: z
    .array(cobroDetalleSchema)
    .min(1, "Debe registrar al menos un método de pago."),
});

export const generarCobroDesdeVentaSchema = z.object({
  ventaPagadorId: z.number().min(1, "Debe seleccionar un pagador de venta."),
  cajaId: z.number().min(1, "Debe seleccionar una caja activa."),
});

export const anularCobroSchema = z.object({
  motivoAnulacion: z
    .string()
    .min(3, "El motivo debe tener al menos 3 caracteres.")
    .max(250, "Máximo 250 caracteres."),
});

export type ConfirmarCobroFormValues = z.infer<typeof confirmarCobroSchema>;
export type GenerarCobroDesdeVentaFormValues = z.infer<
  typeof generarCobroDesdeVentaSchema
>;
export type AnularCobroFormValues = z.infer<typeof anularCobroSchema>;
