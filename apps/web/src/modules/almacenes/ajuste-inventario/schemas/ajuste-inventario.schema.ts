import { z } from "zod";
import { TipoAjusteInventario } from "../types/ajuste-inventario.types";

export const ajusteInventarioDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidad: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
});

export const ajusteInventarioSchema = z.object({
  numero: z.string().optional(),
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén"),
  tipo: z.nativeEnum(TipoAjusteInventario, {
    message: "Seleccione un tipo de ajuste válido",
  }),
  fecha: z
    .string()
    .min(1, "La fecha del ajuste es obligatoria"),
  motivo: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(200, "El motivo no puede exceder 200 caracteres"),
  observacion: z.string().trim().max(500).nullable().optional(),
  detalles: z
    .array(ajusteInventarioDetalleSchema)
    .min(1, "Debe agregar al menos un producto al detalle del ajuste"),
});

export const anularAjusteSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type AjusteInventarioDetalleFormValues = z.infer<
  typeof ajusteInventarioDetalleSchema
>;
export type AjusteInventarioFormValues = z.infer<
  typeof ajusteInventarioSchema
>;
export type AnularAjusteFormValues = z.infer<typeof anularAjusteSchema>;
