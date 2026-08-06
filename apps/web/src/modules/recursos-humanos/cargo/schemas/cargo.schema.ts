import { z } from "zod";

export const cargoSchema = z.object({
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
});

export type CargoFormValues = z.infer<typeof cargoSchema>;