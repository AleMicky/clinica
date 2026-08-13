import { z } from "zod";

export const movimientoCajaSchema = z.object({
  turnoCajaId: z.number().min(1, "Debe seleccionar un turno de caja activo."),
  tipo: z.number().int().min(1, "Debe seleccionar un tipo de movimiento.").max(7),
  fechaHora: z.string().min(1, "La fecha y hora son obligatorias."),
  monto: z.number().positive("El monto debe ser mayor a 0."),
  concepto: z.string().min(1, "El concepto es obligatorio.").max(200, "El concepto no puede superar los 200 caracteres."),
  referencia: z.string().max(100, "La referencia no puede superar los 100 caracteres.").optional().nullable(),
  observacion: z.string().max(500, "La observación no puede superar los 500 caracteres.").optional().nullable(),
});

export type MovimientoCajaFormValues = z.infer<typeof movimientoCajaSchema>;
