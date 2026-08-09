import { z } from "zod";

export const empleadoSchema = z.object({
    personaId: z
        .number({ message: "Seleccione una persona." })
        .int()
        .gt(0, "Seleccione una persona."),

    codigoEmpleado: z
        .string()
        .trim()
        .min(1, "El código de empleado es obligatorio.")
        .max(30, "El código no puede superar los 30 caracteres.")
        .toUpperCase(),

    fechaIngreso: z
        .string()
        .trim()
        .min(1, "La fecha de ingreso es obligatoria.")
        .refine((v) => !isNaN(Date.parse(v)), "Fecha inválida."),

    fechaRetiro: z
        .string()
        .trim()
        .optional()
        .or(z.literal(""))
        .refine((v) => !v || !isNaN(Date.parse(v)), "Fecha inválida."),
});

export type EmpleadoFormValues = z.infer<
    typeof empleadoSchema
>;