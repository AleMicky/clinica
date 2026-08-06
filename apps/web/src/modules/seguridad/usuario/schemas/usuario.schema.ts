import { z } from "zod";

export const usuarioSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
    .max(50, "El nombre de usuario no puede superar 50 caracteres."),

  email: z
    .string()
    .trim()
    .email("Ingrese un correo electrónico válido."),

  password: z
    .string()
    .optional(),

  activo: z.boolean(),

  nombres: z
    .string()
    .trim()
    .min(1, "El nombre de la persona es obligatorio."),

  apellidoPaterno: z
    .string()
    .trim()
    .min(1, "El apellido paterno es obligatorio."),

  apellidoMaterno: z
    .string()
    .trim()
    .optional(),

  tipoDocumento: z
    .string()
    .trim()
    .min(1, "El tipo de documento es obligatorio."),

  numeroDocumento: z
    .string()
    .trim()
    .min(1, "El número de documento es obligatorio."),

  rol: z
    .string()
    .trim()
    .min(1, "Debe seleccionar un rol para el usuario."),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
