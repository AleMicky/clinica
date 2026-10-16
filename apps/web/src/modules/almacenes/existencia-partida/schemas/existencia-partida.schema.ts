import { z } from "zod";

export const existenciaPartidaSchema = z
  .object({
    existenciaId: z
      .number({ message: "La existencia es obligatoria" })
      .min(1, "Debe seleccionar una existencia"),
    partidaInventarioId: z
      .number({ message: "La partida / lote es obligatorio" })
      .min(1, "Debe seleccionar una partida de inventario"),
    cantidad: z
      .number({ message: "Ingrese una cantidad válida" })
      .min(0, "La cantidad no puede ser negativa"),
    cantidadReservada: z
      .number({ message: "Ingrese una cantidad reservada válida" })
      .min(0, "La cantidad reservada no puede ser negativa"),
  })
  .refine((data) => data.cantidadReservada <= data.cantidad, {
    message: "La cantidad reservada no puede superar la cantidad física total",
    path: ["cantidadReservada"],
  });

export type ExistenciaPartidaFormValues = z.infer<typeof existenciaPartidaSchema>;
