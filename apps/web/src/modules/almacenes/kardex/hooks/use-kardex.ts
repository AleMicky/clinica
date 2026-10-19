import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getKardex } from "../api/kardex.api";
import { kardexKeys } from "../api/kardex.key";
import type { KardexQueryParams, KardexResponse } from "../types/kardex.types";

export function useKardex(
  params?: KardexQueryParams,
  options?: Omit<UseQueryOptions<KardexResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: kardexKeys.detail(params),
    queryFn: () => getKardex(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
