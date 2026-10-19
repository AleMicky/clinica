import type { KardexQueryParams } from "../types/kardex.types";

export const kardexKeys = {
  all: ["kardex"] as const,
  detail: (params?: KardexQueryParams) => [...kardexKeys.all, params] as const,
};
