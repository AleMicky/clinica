import { z } from "zod"

export const loginSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "Introduce tu nombre de usuario."),
  password: z
    .string()
    .trim()
    .min(1, "Introduce tu contraseña."),
})

export type ActivoFormInput = z.infer<typeof loginSchema>
export type LoginFormValues = z.output<typeof loginSchema>

export const loginDefaultValues: ActivoFormInput = {
  userName: "",
  password: "",
}
