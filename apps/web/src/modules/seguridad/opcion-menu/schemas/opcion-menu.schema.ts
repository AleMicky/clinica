import { z } from "zod";

export const opcionMenuSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .max(100, "El código no puede superar los 100 caracteres."),

  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),

  ruta: z
    .string()
    .trim()
    .max(250, "La ruta no puede superar los 250 caracteres.")
    .optional(),

  icono: z
    .string()
    .trim()
    .max(100, "El icono no puede superar los 100 caracteres.")
    .optional(),

  padreId: z
    .number()
    .nullable()
    .optional(),

  orden: z
    .number()
    .int("El orden debe ser un número entero.")
    .min(0, "El orden no puede ser menor a 0."),
});

export type OpcionMenuFormValues = z.infer<typeof opcionMenuSchema>;
