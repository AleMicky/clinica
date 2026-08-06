import { z } from "zod";

export const areaSchema = z.object({
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

    tipoAreaId: z
        .number({ message: "Debe seleccionar un tipo de área." })
        .int("El tipo de área es inválido.")
        .min(1, "Debe seleccionar un tipo de área."),

    areaPadreId: z
        .number()
        .int()
        .min(1)
        .optional()
        .nullable(),
});

export type AreaFormValues = z.infer<typeof areaSchema>;