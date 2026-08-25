import { z } from "zod";

export const turnoCajaSchema = z.object({
  cajaId: z
    .number()
    .min(1, "Debe seleccionar una caja válida."),
  empleadoId: z
    .number()
    .min(1, "Debe seleccionar un empleado válido."),
  fechaHoraApertura: z
    .string()
    .min(1, "La fecha y hora de apertura es obligatoria."),
  montoInicial: z
    .number()
    .min(0, "El monto inicial no puede ser negativo."),
  observacionApertura: z
    .string()
    .max(500, "La observación de apertura no puede exceder 500 caracteres.")
    .optional()
    .nullable(),
  fechaHoraCierre: z
    .string()
    .optional()
    .nullable(),
  observacionCierre: z
    .string()
    .max(500, "La observación de cierre no puede exceder 500 caracteres.")
    .optional()
    .nullable(),
  estado: z
    .number()
    .int()
    .min(1)
    .max(2),
});

export type TurnoCajaFormValues = z.infer<typeof turnoCajaSchema>;
