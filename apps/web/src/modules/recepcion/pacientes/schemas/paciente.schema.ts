import { z } from "zod";

export const pacienteSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  apellidoPaterno: z
    .string()
    .trim()
    .min(1, "El apellido paterno es obligatorio.")
    .max(50, "El apellido paterno no puede superar los 50 caracteres."),

  apellidoMaterno: z
    .string()
    .trim()
    .max(50, "El apellido materno no puede superar los 50 caracteres.")
    .optional()
    .or(z.literal("")),

  fechaNacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria."),

  telefono: z
    .string()
    .trim()
    .max(30, "El teléfono no puede superar los 30 caracteres.")
    .optional()
    .or(z.literal("")),

  direccion: z
    .string()
    .trim()
    .max(200, "La dirección no puede superar los 200 caracteres.")
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
    .max(20, "El número de documento no puede superar los 20 caracteres."),

  extensionDocumento: z
    .string()
    .trim()
    .max(20, "La extensión no puede superar los 20 caracteres.")
    .optional()
    .or(z.literal("")),

  complementoDocumento: z
    .string()
    .trim()
    .max(10, "El complemento no puede superar los 10 caracteres.")
    .optional()
    .or(z.literal("")),

  genero: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),

  estadoCivil: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
});

export type PacienteFormValues = z.infer<typeof pacienteSchema>;

export const pacienteConvenioSchema = z.object({
  convenioId: z.number().min(1, "Debe seleccionar un convenio."),
  numeroAfiliado: z
    .string()
    .trim()
    .max(50, "El número de afiliado no puede superar 50 caracteres.")
    .optional()
    .or(z.literal("")),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria."),
  fechaFin: z.string().optional().or(z.literal("")),
  esPrincipal: z.boolean(),
});

export type PacienteConvenioFormValues = z.infer<typeof pacienteConvenioSchema>;
