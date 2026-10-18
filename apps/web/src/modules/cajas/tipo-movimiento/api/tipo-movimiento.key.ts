export const tipoMovimientoCajaKeys = {
  all: ["tipos-movimiento-caja"] as const,
  tipos: (naturaleza?: string) =>
    [...tipoMovimientoCajaKeys.all, "tipos", { naturaleza }] as const,
  tipoDetail: (id: number) =>
    [...tipoMovimientoCajaKeys.all, "tipo", id] as const,
  conceptos: (tipoMovimientoCajaId?: number) =>
    [...tipoMovimientoCajaKeys.all, "conceptos", { tipoMovimientoCajaId }] as const,
  conceptoDetail: (id: number) =>
    [...tipoMovimientoCajaKeys.all, "concepto", id] as const,
};

export { conceptoMovimientoCajaKeys } from "./concepto-movimiento.key";
