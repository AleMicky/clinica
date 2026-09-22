import { z } from "zod";

export const empleadoSchema = z
  .object({
    nombres: z
      .string()
      .trim()
      .min(1, "Los nombres son obligatorios.")
      .max(100, "Los nombres no pueden superar los 100 caracteres."),

    apellidoPaterno: z
      .string()
      .trim()
      .min(1, "El apellido paterno es obligatorio.")
      .max(100, "El apellido paterno no puede superar los 100 caracteres."),

    apellidoMaterno: z
      .string()
      .trim()
      .max(100, "El apellido materno no puede superar los 100 caracteres.")
      .optional()
      .or(z.literal("")),

    tipoDocumento: z
      .string()
      .trim()
      .min(1, "El tipo de documento es obligatorio.")
      .max(20, "El tipo de documento no puede superar los 20 caracteres."),

    numeroDocumento: z
      .string()
      .trim()
      .min(1, "El número de documento es obligatorio.")
      .max(30, "El número de documento no puede superar los 30 caracteres."),

    extensionDocumento: z
      .string()
      .trim()
      .max(10, "La extensión no puede superar los 10 caracteres.")
      .optional()
      .or(z.literal("")),

    complementoDocumento: z
      .string()
      .trim()
      .max(10, "El complemento no puede superar los 10 caracteres.")
      .optional()
      .or(z.literal("")),

    fechaNacimiento: z
      .string()
      .trim()
      .min(1, "La fecha de nacimiento es obligatoria.")
      .refine((v) => !isNaN(Date.parse(v)), "Fecha de nacimiento inválida."),

    genero: z
      .string()
      .trim()
      .max(20, "El género no puede superar los 20 caracteres.")
      .optional()
      .or(z.literal("")),

    estadoCivil: z
      .string()
      .trim()
      .max(20, "El estado civil no puede superar los 20 caracteres.")
      .optional()
      .or(z.literal("")),

    telefono: z
      .string()
      .trim()
      .max(20, "El teléfono no puede superar los 20 caracteres.")
      .optional()
      .or(z.literal("")),

    direccion: z
      .string()
      .trim()
      .max(255, "La dirección no puede superar los 255 caracteres.")
      .optional()
      .or(z.literal("")),

    // Parámetros Laborales

    fechaIngreso: z
      .string()
      .trim()
      .min(1, "La fecha de ingreso es obligatoria.")
      .refine((v) => !isNaN(Date.parse(v)), "Fecha de ingreso inválida."),

    fechaRetiro: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || !isNaN(Date.parse(v)), "Fecha de retiro inválida."),
  })
  .superRefine((data, ctx) => {
    // Validar coherencia de fechas laborales
    if (data.fechaIngreso && data.fechaRetiro) {
      const fi = new Date(data.fechaIngreso);
      const fr = new Date(data.fechaRetiro);
      if (fr < fi) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fechaRetiro"],
          message: "La fecha de retiro no puede ser anterior a la fecha de ingreso.",
        });
      }
    }
  });

export type EmpleadoFormValues = z.infer<typeof empleadoSchema>;