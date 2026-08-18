import { z } from "zod";

export const aperturaCajaSchema = z.object({
  turnoCajaId: z.number().int().positive("Debe seleccionar un turno de caja válido"),
  fechaHora: z.string().min(1, "La fecha y hora de apertura es requerida"),
  montoInicial: z.number().min(0, "El monto inicial no puede ser negativo"),
  observacion: z.string().max(500, "La observación no puede exceder 500 caracteres").optional().nullable(),
});

export type AperturaCajaFormValues = z.infer<typeof aperturaCajaSchema>;
