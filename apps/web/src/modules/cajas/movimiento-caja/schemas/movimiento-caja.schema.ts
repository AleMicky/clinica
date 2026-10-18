import { z } from "zod";

export const movimientoCajaSchema = z.object({
  turnoCajaId: z.number().min(1, "Debe seleccionar un turno de caja activo."),
  tipoMovimientoCajaId: z.number().min(1, "Debe seleccionar un tipo de movimiento."),
  conceptoMovimientoCajaId: z.number().min(1, "Debe seleccionar un concepto de movimiento."),
  monedaId: z.number().min(1, "Debe seleccionar una moneda."),
  monto: z.number().positive("El monto debe ser mayor a 0."),
  tipoCambio: z.number().positive("El tipo de cambio debe ser mayor a 0."),
  referencia: z.string().max(100, "La referencia no puede superar los 100 caracteres.").optional().nullable(),
  observacion: z.string().max(500, "La observación no puede superar los 500 caracteres.").optional().nullable(),
});

export type MovimientoCajaFormValues = z.infer<typeof movimientoCajaSchema>;
