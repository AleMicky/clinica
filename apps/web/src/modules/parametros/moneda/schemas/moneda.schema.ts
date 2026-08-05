import { z } from "zod";

export const monedaSchema = z.object({
    codigo: z
        .string()
        .trim()
        .min(2, "El código debe tener al menos 2 caracteres.")
        .max(10, "El código no puede superar los 10 caracteres.")
        .toUpperCase(),

    nombre: z
        .string()
        .trim()
        .min(2, "El nombre debe tener al menos 2 caracteres.")
        .max(50, "El nombre no puede superar los 50 caracteres."),

    simbolo: z
        .string()
        .trim()
        .min(1, "El símbolo es obligatorio.")
        .max(10, "El símbolo no puede superar los 10 caracteres."),

    decimales: z
        .number()
        .int("Los decimales deben ser un número entero.")
        .min(0, "Los decimales no pueden ser menores a 0.")
        .max(8, "Los decimales no pueden ser mayores a 8."),

    esMonedaBase: z.boolean(),

    estado: z.enum(["Activo", "Inactivo"]),
});

export type MonedaFormValues = z.infer<typeof monedaSchema>;
