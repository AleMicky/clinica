import { z } from "zod";

export const productoSchema = z
  .object({
    codigo: z
      .string()
      .min(1, "El código es obligatorio")
      .max(20, "El código no puede superar los 20 caracteres")
      .toUpperCase(),
    nombre: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(150, "El nombre no puede superar los 150 caracteres"),
    descripcion: z
      .string()
      .max(500, "La descripción no puede superar los 500 caracteres")
      .optional()
      .nullable(),
    categoriaProductoId: z
      .number({ message: "La categoría de producto es obligatoria" })
      .int()
      .positive("La categoría de producto es obligatoria"),
    unidadMedidaId: z
      .number({ message: "La unidad de medida es obligatoria" })
      .int()
      .positive("La unidad de medida es obligatoria"),
    controlaLote: z.boolean(),
    controlaVencimiento: z.boolean(),
    stockMinimo: z
      .number({ message: "El stock mínimo es obligatorio" })
      .min(0, "El stock mínimo no puede ser negativo"),
    stockMaximo: z
      .number()
      .min(0, "El stock máximo no puede ser negativo")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.stockMaximo !== null && data.stockMaximo !== undefined) {
        return data.stockMinimo <= data.stockMaximo;
      }
      return true;
    },
    {
      message: "El stock mínimo no puede ser mayor que el stock máximo",
      path: ["stockMaximo"],
    }
  );

export type ProductoFormValues = z.infer<typeof productoSchema>;
