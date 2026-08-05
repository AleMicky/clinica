import { z } from "zod";

export const loginSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(1, "El nombre de usuario es obligatorio.")
        .max(
            100,
            "El nombre de usuario no puede superar 100 caracteres.",
        ),

    password: z
        .string()
        .min(1, "La contraseña es obligatoria.")
        .min(
            6,
            "La contraseña debe tener al menos 6 caracteres.",
        ),

    rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<
    typeof loginSchema
>;