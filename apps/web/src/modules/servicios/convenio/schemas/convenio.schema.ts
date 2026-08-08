import { z } from "zod";

export const convenioSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(20, "El código no debe exceder 20 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(120, "El nombre no debe exceder 120 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no debe exceder 500 caracteres")
    .optional()
    .nullable(),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().optional().nullable(),
});

export type ConvenioFormValues = z.infer<typeof convenioSchema>;

export const convenioTarifarioSchema = z.object({
  tarifarioId: z.number().min(1, "Tarifario requerido"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().optional().nullable(),
});

export type ConvenioTarifarioFormValues = z.infer<typeof convenioTarifarioSchema>;
