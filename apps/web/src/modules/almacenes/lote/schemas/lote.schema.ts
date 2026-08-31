import { z } from "zod";

export const loteSchema = z
  .object({
    productoId: z
      .number({ message: "El producto es obligatorio" })
      .int()
      .positive("El producto es obligatorio"),
    numeroLote: z
      .string()
      .min(1, "El número de lote es obligatorio")
      .max(50, "El número de lote no puede superar los 50 caracteres")
      .trim()
      .toUpperCase(),
    fechaFabricacion: z
      .string()
      .optional()
      .nullable(),
    fechaVencimiento: z
      .string()
      .optional()
      .nullable(),
    costoUnitario: z
      .number()
      .min(0, "El costo unitario no puede ser negativo")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.fechaFabricacion && data.fechaVencimiento) {
        return new Date(data.fechaVencimiento) >= new Date(data.fechaFabricacion);
      }
      return true;
    },
    {
      message: "La fecha de vencimiento no puede ser anterior a la de fabricación",
      path: ["fechaVencimiento"],
    }
  );

export type LoteFormValues = z.infer<typeof loteSchema>;
