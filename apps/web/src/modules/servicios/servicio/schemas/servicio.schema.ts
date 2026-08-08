import { z } from "zod";

export const servicioSchema = z.object({
  categoriaServicioId: z
    .number()
    .min(1, "Debe seleccionar una categoría válida"),
  codigo: z
    .string()
    .min(1, "El código es requerido")
    .max(20, "El código no debe exceder 20 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(150, "El nombre no debe exceder 150 caracteres"),
  descripcion: z
    .string()
    .max(500, "La descripción no debe exceder 500 caracteres")
    .optional()
    .nullable(),
});

export type ServicioFormValues = z.infer<typeof servicioSchema>;
