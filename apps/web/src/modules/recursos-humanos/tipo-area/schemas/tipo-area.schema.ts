import { z } from "zod";

export const tipoAreaSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(1, "El código es obligatorio.")
        .max(10, "El código no puede superar los 10 caracteres.")
        .toUpperCase(),

    nombre: z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio.")
        .max(100, "El nombre no puede superar los 100 caracteres."),

    descripcion: z
        .string()
        .trim()
        .max(250, "La descripción no puede superar los 250 caracteres.")
        .optional()
        .or(z.literal("")),

    orden: z
        .number({ message: "El orden debe ser un número entero." })
        .int("El orden debe ser un número entero.")
        .min(0, "El orden no puede ser menor a 0."),
});

export type TipoAreaFormValues = z.infer<typeof tipoAreaSchema>;