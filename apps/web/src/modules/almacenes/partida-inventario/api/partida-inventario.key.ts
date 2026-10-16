import type { PartidaInventarioQueryParams } from "../types/partida-inventario.types";

export const partidaInventarioKeys = {
  all: ["partidas-inventario"] as const,
  lists: () => [...partidaInventarioKeys.all, "list"] as const,
  list: (params?: PartidaInventarioQueryParams) =>
    [...partidaInventarioKeys.lists(), params] as const,
  byProducto: (productoId: number) =>
    [...partidaInventarioKeys.lists(), { productoId }] as const,
  details: () => [...partidaInventarioKeys.all, "detail"] as const,
  detail: (id: number) => [...partidaInventarioKeys.details(), id] as const,
};
