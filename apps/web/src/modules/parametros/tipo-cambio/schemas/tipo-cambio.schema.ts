import { z } from "zod";

export const tipoCambioSchema = z
  .object({
    monedaOrigenId: z.number().int().min(1, "Seleccione la moneda de origen."),
    monedaDestinoId: z.number().int().min(1, "Seleccione la moneda de destino."),
    compra: z
      .number({ message: "La tasa de compra debe ser un número válido." })
      .positive("La tasa de compra debe ser mayor a 0."),
    venta: z
      .number({ message: "La tasa de venta debe ser un número válido." })
      .positive("La tasa de venta debe ser mayor a 0."),
    fecha: z
      .string()
      .min(1, "La fecha es obligatoria.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)."),
  })
  .refine((data) => data.monedaOrigenId !== data.monedaDestinoId, {
    message: "La moneda de origen y destino deben ser diferentes.",
    path: ["monedaDestinoId"],
  });

export type TipoCambioFormValues = z.infer<typeof tipoCambioSchema>;
