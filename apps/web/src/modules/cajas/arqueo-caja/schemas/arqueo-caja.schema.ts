import { z } from "zod";

export const arqueoDetalleSchema = z.object({
  metodoPagoId: z.number().min(1, "Seleccione un método de pago."),
  monedaId: z.number().min(1, "Seleccione una moneda."),
  montoEsperado: z.number().min(0),
  montoContado: z.number().min(0, "El monto contado debe ser mayor o igual a 0."),
});

export const registrarArqueoCajaSchema = z.object({
  turnoCajaId: z.number().min(1, "Debe seleccionar un turno de caja abierto."),
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres.")
    .optional()
    .nullable(),
  detalles: z
    .array(arqueoDetalleSchema)
    .min(1, "Debe registrar al menos un detalle de arqueo por método de pago."),
});

export const arqueoCajaSchema = registrarArqueoCajaSchema;

export type RegistrarArqueoCajaFormValues = z.infer<
  typeof registrarArqueoCajaSchema
>;
export type ArqueoCajaFormValues = RegistrarArqueoCajaFormValues;
