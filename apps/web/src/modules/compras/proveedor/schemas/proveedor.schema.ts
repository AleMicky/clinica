import { z } from "zod";

export const proveedorSchema = z.object({
  codigo: z
    .string()
    .min(1, "El código es obligatorio.")
    .max(20, "El código no puede superar los 20 caracteres."),
  razonSocial: z
    .string()
    .min(1, "La razón social es obligatoria.")
    .max(150, "La razón social no puede superar los 150 caracteres."),
  nombreComercial: z
    .string()
    .max(150, "El nombre comercial no puede superar los 150 caracteres.")
    .optional()
    .nullable(),
  nit: z
    .string()
    .max(20, "El NIT no puede superar los 20 caracteres.")
    .optional()
    .nullable(),
  direccion: z
    .string()
    .max(250, "La dirección no puede superar los 250 caracteres.")
    .optional()
    .nullable(),
  telefono: z
    .string()
    .max(20, "El teléfono no puede superar los 20 caracteres.")
    .optional()
    .nullable(),
  celular: z
    .string()
    .max(20, "El celular no puede superar los 20 caracteres.")
    .optional()
    .nullable(),
  email: z
    .string()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "El correo electrónico no es válido."
    )
    .optional()
    .nullable(),
  contacto: z
    .string()
    .max(100, "El contacto no puede superar los 100 caracteres.")
    .optional()
    .nullable(),
  observacion: z
    .string()
    .max(500, "La observación no puede superar los 500 caracteres.")
    .optional()
    .nullable(),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;
