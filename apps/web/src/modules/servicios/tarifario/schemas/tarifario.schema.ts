import { z } from "zod";

export const tarifarioSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(20, "El código no debe exceder 20 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no debe exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no debe exceder 500 caracteres")
    .optional()
    .nullable(),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  fechaFin: z.string().optional().nullable(),
  monedaId: z.number().min(1, "Moneda requerida"),
  esPrincipal: z.boolean(),
});

export type TarifarioFormValues = z.infer<typeof tarifarioSchema>;

export const tarifarioDetalleSchema = z.object({
  servicioId: z.number().min(1, "Servicio requerido"),
  precio: z.number().min(0, "El precio no puede ser negativo"),
});

export type TarifarioDetalleFormValues = z.infer<typeof tarifarioDetalleSchema>;
