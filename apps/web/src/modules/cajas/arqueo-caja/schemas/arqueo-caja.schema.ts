import { z } from "zod";

export const arqueoDetalleSchema = z.object({
  metodoPagoId: z.number().min(1, "Seleccione un método de pago."),
  monedaId: z.number().min(1, "Seleccione una moneda."),
  montoEsperado: z.number().min(0, "El monto esperado debe ser mayor o igual a 0."),
  montoContado: z.number().min(0, "El monto contado debe ser mayor o igual a 0."),
});

export const arqueoCajaSchema = z.object({
  turnoCajaId: z.number().min(1, "Seleccione un turno de caja."),
  fechaHora: z.string().min(1, "La fecha y hora son obligatorias."),
  observacion: z.string().max(500, "La observación no puede superar los 500 caracteres.").optional().nullable(),
  detalles: z.array(arqueoDetalleSchema).min(1, "Debe registrar al menos un detalle de arqueo por método de pago."),
});

export type ArqueoCajaFormValues = z.infer<typeof arqueoCajaSchema>;
