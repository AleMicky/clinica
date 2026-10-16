import type { ExistenciaPartidaQueryParams } from "../types/existencia-partida.types";

export const existenciaPartidaKeys = {
  all: ["existencias-partidas"] as const,
  lists: () => [...existenciaPartidaKeys.all, "list"] as const,
  list: (params?: ExistenciaPartidaQueryParams) =>
    [...existenciaPartidaKeys.lists(), params] as const,
  details: () => [...existenciaPartidaKeys.all, "detail"] as const,
  detail: (id: number) => [...existenciaPartidaKeys.details(), id] as const,
};
