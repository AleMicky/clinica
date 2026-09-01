import type { ConsumoInternoQueryParams } from "../types/consumo-interno.types";

export const consumoInternoKeys = {
  all: ["consumos-interno"] as const,
  lists: () => [...consumoInternoKeys.all, "list"] as const,
  list: (params?: ConsumoInternoQueryParams) =>
    [...consumoInternoKeys.lists(), params] as const,
  details: () => [...consumoInternoKeys.all, "detail"] as const,
  detail: (id: number) => [...consumoInternoKeys.details(), id] as const,
};
