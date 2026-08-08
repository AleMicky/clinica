import { z } from "zod";

export const CATEGORIAS_UNIDAD_MEDIDA = [
  "Dosificación",
  "Peso",
  "Volumen",
  "Presentación",
  "Unidades",
  "Otros",
] as const;

export const unidadMedidaSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "El código es obligatorio.")
    .max(20, "El código no puede superar los 20 caracteres.")
    .toUpperCase(),

  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),

  simbolo: z
    .string()
    .trim()
    .min(1, "El símbolo es obligatorio.")
    .max(10, "El símbolo no puede superar los 10 caracteres."),

  categoria: z
    .string()
    .trim()
    .min(1, "La categoría es obligatoria.")
    .max(50, "La categoría no puede superar los 50 caracteres."),
});

export type UnidadMedidaFormValues = z.infer<typeof unidadMedidaSchema>;
