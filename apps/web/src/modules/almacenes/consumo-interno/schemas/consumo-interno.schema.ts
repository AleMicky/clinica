import { z } from "zod";

export const consumoInternoDetalleSchema = z.object({
  productoId: z
    .number()
    .min(1, "Debe seleccionar un producto válido"),
  productoNombre: z.string().optional(),
  loteId: z.number().nullable().optional(),
  cantidad: z
    .number()
    .positive("La cantidad debe ser mayor a 0"),
});

export const consumoInternoSchema = z.object({
  numero: z
    .string()
    .trim()
    .min(1, "El número de vale es obligatorio")
    .max(50, "El número no puede exceder 50 caracteres"),
  almacenId: z
    .number()
    .min(1, "Debe seleccionar un almacén emisor"),
  areaId: z
    .number()
    .min(1, "Debe seleccionar un área o servicio solicitante"),
  fecha: z
    .string()
    .min(1, "La fecha de consumo es obligatoria"),
  referenciaTipo: z.string().trim().max(50).nullable().optional(),
  referenciaId: z.number().nullable().optional(),
  observacion: z.string().trim().max(500).nullable().optional(),
  detalles: z
    .array(consumoInternoDetalleSchema)
    .min(1, "Debe agregar al menos un producto a despachar para consumo"),
});

export const anularConsumoSchema = z.object({
  motivoAnulacion: z
    .string()
    .trim()
    .min(3, "El motivo de anulación debe tener al menos 3 caracteres")
    .max(500, "El motivo no puede exceder 500 caracteres"),
});

export type ConsumoInternoDetalleFormValues = z.infer<
  typeof consumoInternoDetalleSchema
>;
export type ConsumoInternoFormValues = z.infer<
  typeof consumoInternoSchema
>;
export type AnularConsumoFormValues = z.infer<typeof anularConsumoSchema>;
