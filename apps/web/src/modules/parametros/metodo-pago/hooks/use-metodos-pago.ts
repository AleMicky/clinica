"use client";

import { useQuery } from "@tanstack/react-query";
import { getMetodoPagoById, getMetodosPago } from "../api/metodo-pago.api";
import { metodoPagoKeys } from "../api/metodo-pago.key";
import type { MetodoPagoQueryParams } from "../types/metodo-pago.types";

export function useMetodosPago(
  params?: MetodoPagoQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: metodoPagoKeys.list(params as Record<string, unknown>),
    queryFn: () => getMetodosPago(params),
    enabled,
  });
}

export function useMetodoPago(id: number, enabled = true) {
  return useQuery({
    queryKey: metodoPagoKeys.detail(id),
    queryFn: () => getMetodoPagoById(id),
    enabled: enabled && id > 0,
  });
}
