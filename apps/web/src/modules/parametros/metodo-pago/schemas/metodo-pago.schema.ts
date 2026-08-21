import { z } from "zod";

export const metodoPagoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .max(20, "El código no puede superar los 20 caracteres.")
    .toUpperCase(),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  requiereReferencia: z.boolean(),
});

export type MetodoPagoFormValues = z.infer<typeof metodoPagoSchema>;
