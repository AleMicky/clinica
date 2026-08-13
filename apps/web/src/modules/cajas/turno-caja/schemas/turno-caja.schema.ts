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
  fechaHoraCierre: z
    .string()
    .optional()
    .nullable(),
  estado: z
    .number()
    .int()
    .min(1)
    .max(2),
});

export type TurnoCajaFormValues = z.infer<typeof turnoCajaSchema>;
