import { z } from "zod";

export const cobroDetalleSchema = z.object({
  metodoPagoId: z.number().min(1, "Seleccione un método de pago."),
  monedaId: z.number().min(1, "Seleccione una moneda."),
  cuentaBancariaId: z.number().optional().nullable(),
  monto: z.number().positive("El monto debe ser positivo."),
  tipoCambio: z.number().default(1),
  referencia: z.string().max(100).optional().nullable(),
  entidadFinanciera: z.string().max(100).optional().nullable(),
  observacion: z.string().max(250).optional().nullable(),
});

export const cobroSchema = z.object({
  turnoCajaId: z.number().min(1, "Seleccione un turno de caja activo."),
  ventaPagadorId: z.number().min(1, "Seleccione o ingrese un pagador de venta."),
  fechaHora: z.string().min(1, "La fecha y hora es obligatoria."),
  observacion: z.string().max(500).optional().nullable(),
  detalles: z.array(cobroDetalleSchema).min(1, "Debe registrar al menos un método de cobro."),
});

export const anularCobroSchema = z.object({
  motivoAnulacion: z.string().min(3, "El motivo debe tener al menos 3 caracteres.").max(250, "Máximo 250 caracteres."),
});

export type CobroFormValues = z.infer<typeof cobroSchema>;
export type AnularCobroFormValues = z.infer<typeof anularCobroSchema>;
