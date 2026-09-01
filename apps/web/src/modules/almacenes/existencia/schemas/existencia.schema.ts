import { z } from "zod";

export const existenciaSchema = z
  .object({
    almacenId: z.number({ message: "El almacén es obligatorio" }).min(1, "El almacén es obligatorio"),
    productoId: z.number({ message: "El producto es obligatorio" }).min(1, "El producto es obligatorio"),
    loteId: z.number().nullable().optional(),
    cantidad: z.number({ message: "Ingrese una cantidad válida" }).min(0, "La cantidad no puede ser negativa"),
    cantidadReservada: z.number({ message: "Ingrese una cantidad reservada válida" }).min(0, "La cantidad reservada no puede ser negativa"),
  })
  .refine((data) => data.cantidadReservada <= data.cantidad, {
    message: "La cantidad reservada no puede ser mayor que la cantidad total",
    path: ["cantidadReservada"],
  });

export type ExistenciaFormValues = z.infer<typeof existenciaSchema>;
