import { z } from "zod";

export const catalogoGrupoSchema = z.object({
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede exceder 30 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(250, "La descripción no puede exceder 250 caracteres")
    .optional(),
});

export type CatalogoGrupoFormValues = z.infer<typeof catalogoGrupoSchema>;

export const catalogoItemSchema = z.object({
  valor: z
    .string()
    .min(1, "El valor/código del ítem es requerido")
    .max(50, "El valor no puede exceder 50 caracteres")
    .toUpperCase(),
  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  orden: z
    .number()
    .min(0, "El orden debe ser mayor o igual a 0"),
});

export type CatalogoItemFormValues = z.infer<typeof catalogoItemSchema>;
