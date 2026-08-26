import { z } from "zod";

export const abrirTurnoCajaSchema = z.object({
  cajaId: z.number().min(1, "Debe seleccionar una caja válida."),
  empleadoId: z.number().min(1, "Debe seleccionar un empleado/cajero."),
  montoInicial: z
    .number()
    .min(0, "El monto inicial no puede ser negativo."),
  observacion: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres.")
    .optional()
    .nullable(),
});

export const cerrarTurnoCajaSchema = z.object({
  observacion: z
    .string()
    .max(500, "La observación no puede exceder 500 caracteres.")
    .optional()
    .nullable(),
});

export type AbrirTurnoCajaFormValues = z.infer<typeof abrirTurnoCajaSchema>;
export type CerrarTurnoCajaFormValues = z.infer<typeof cerrarTurnoCajaSchema>;
