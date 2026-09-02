import { z } from "zod";
import { TipoBajaInventario } from "../types/baja-inventario.types";

export const bajaInventarioDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidad: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  observacion: z.string().trim().max(250).nullable().optional(),
});

export const bajaInventarioSchema = z.object({
  numero: z.string().optional(),
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén"),
  tipo: z.nativeEnum(TipoBajaInventario, {
    message: "Seleccione un motivo o tipo de baja válido",
  }),
  fecha: z
    .string()
    .min(1, "La fecha de la baja es obligatoria"),
  motivo: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "El motivo no puede exceder 200 caracteres"),
  observacion: z.string().trim().max(500).nullable().optional(),
  detalles: z
    .array(bajaInventarioDetalleSchema)
    .min(1, "Debe agregar al menos un producto a la lista de bajas"),
});

export const anularBajaSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type BajaInventarioDetalleFormValues = z.infer<
  typeof bajaInventarioDetalleSchema
>;
export type BajaInventarioFormValues = z.infer<
  typeof bajaInventarioSchema
>;
export type AnularBajaFormValues = z.infer<typeof anularBajaSchema>;
