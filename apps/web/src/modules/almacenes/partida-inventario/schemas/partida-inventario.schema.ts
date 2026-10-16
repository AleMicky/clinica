import { z } from "zod";

export const partidaInventarioSchema = z.object({
  productoId: z
    .number({ message: "El producto es obligatorio" })
    .int()
    .positive("El producto es obligatorio"),
  numeroPartida: z
    .string()
    .max(50, "El número de partida no puede superar los 50 caracteres")
    .optional()
    .nullable(),
  fechaVencimiento: z
    .string()
    .optional()
    .nullable(),
  costoUnitario: z
    .number({ message: "El costo unitario es obligatorio" })
    .min(0, "El costo unitario no puede ser negativo"),
});

export type PartidaInventarioFormValues = z.infer<typeof partidaInventarioSchema>;
