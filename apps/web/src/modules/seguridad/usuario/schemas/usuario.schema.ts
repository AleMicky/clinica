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
    .optional()
    .refine(
      (val) => {
        if (!val || val.length === 0) return true; // Opcional si se deja en blanco
        return (
          val.length >= 6 &&
          /[0-9]/.test(val) &&
          /[A-Z]/.test(val) &&
          /[a-z]/.test(val)
        );
      },
      {
        message:
          "La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una minúscula y un número.",
      }
    ),

  activo: z.boolean(),

  // Persona fields (required when creating new user, optional when editing)
  nombres: z.string().trim().optional(),
  apellidoPaterno: z.string().trim().optional(),
  apellidoMaterno: z.string().trim().optional(),
  fechaNacimiento: z.string().optional(),
  tipoDocumento: z.string().trim().optional(),
  numeroDocumento: z.string().trim().optional(),
  extensionDocumento: z.string().trim().optional(),
  complementoDocumento: z.string().trim().optional(),
  genero: z.string().trim().optional(),
  estadoCivil: z.string().trim().optional(),

  roles: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un rol para el usuario."),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
